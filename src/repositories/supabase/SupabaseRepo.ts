import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { 
  ToolRepo, 
  ToolSpec, 
  ToolMeta, 
  ToolSpecRecord, 
  ToolSpecVersion, 
  Profile 
} from '../../../shared/types';
import { specHash } from '../../../shared/canonicalize';
import { config } from '../../config';

export class SupabaseRepo implements ToolRepo {
  private client: SupabaseClient;
  private currentUser: User | null = null;

  constructor() {
    this.client = createClient(
      config.supabase.url,
      config.supabase.anonKey
    );

    // Listen for auth changes
    this.client.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
    });
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUser) {
      const { data: { user } } = await this.client.auth.getUser();
      this.currentUser = user;
    }
    return this.currentUser;
  }

  async ensureProfile(user: User): Promise<Profile> {
    const { data: profile, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const newProfile = {
        id: user.id,
        email: user.email || '',
        created_at: new Date().toISOString()
      };

      const { data, error: insertError } = await this.client
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create profile: ${insertError.message}`);
      }

      return data;
    } else if (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }

    return profile;
  }

  async get(id: string): Promise<{ spec: ToolSpec; meta: ToolMeta } | null> {
    try {
      // Get toolspec with latest version
      const { data: toolspec, error: toolspecError } = await this.client
        .from('toolspecs')
        .select(`
          *,
          profiles:owner (email),
          toolspec_versions!inner (
            spec,
            version,
            created_at
          )
        `)
        .eq('id', id)
        .eq('toolspec_versions.version', 1) // TODO: Use RPC to get current version
        .single();

      if (toolspecError || !toolspec) {
        return null;
      }

      const version = toolspec.toolspec_versions[0];
      if (!version) {
        return null;
      }

      return {
        spec: version.spec as ToolSpec,
        meta: {
          id: toolspec.id,
          owner: toolspec.owner,
          name: toolspec.name,
          specHash: toolspec.spec_hash,
          isPublic: toolspec.is_public,
          updatedAt: toolspec.updated_at,
          source: "supabase"
        }
      };
    } catch (error) {
      console.error('Failed to get Supabase tool:', error);
      return null;
    }
  }

  async list(params?: {
    limit?: number;
    ownerOnly?: boolean;
    query?: string;
  }): Promise<ToolMeta[]> {
    try {
      let query = this.client
        .from('toolspecs')
        .select(`
          id,
          owner,
          name,
          spec_hash,
          is_public,
          updated_at,
          profiles:owner (email)
        `)
        .order('updated_at', { ascending: false });

      // Filter by owner if requested and user is authenticated
      if (params?.ownerOnly) {
        const user = await this.getCurrentUser();
        if (user) {
          query = query.eq('owner', user.id);
        } else {
          return []; // No tools for unauthenticated user
        }
      } else {
        // Show public tools for general listing
        query = query.eq('is_public', true);
      }

      // Apply text search
      if (params?.query) {
        query = query.textSearch('name', params.query);
      }

      // Apply limit
      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data: toolspecs, error } = await query;

      if (error) {
        console.error('Failed to list Supabase tools:', error);
        return [];
      }

      return (toolspecs || []).map((toolspec): ToolMeta => ({
        id: toolspec.id,
        owner: toolspec.owner,
        name: toolspec.name,
        specHash: toolspec.spec_hash,
        isPublic: toolspec.is_public,
        updatedAt: toolspec.updated_at,
        source: "supabase"
      }));
    } catch (error) {
      console.error('Failed to list Supabase tools:', error);
      return [];
    }
  }

  async save(spec: ToolSpec, meta?: Partial<ToolMeta>): Promise<ToolMeta> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required to save tools');
    }

    try {
      await this.ensureProfile(user);
      
      const now = new Date().toISOString();
      const hash = await specHash(spec);
      
      // Check if toolspec with same hash exists for this user
      const { data: existing } = await this.client
        .from('toolspecs')
        .select('*')
        .eq('owner', user.id)
        .eq('spec_hash', hash)
        .single();

      let toolspecId: string;
      let currentVersion = 1;

      if (existing) {
        // Update existing toolspec
        toolspecId = existing.id;
        currentVersion = existing.current_version + 1;

        const { error: updateError } = await this.client
          .from('toolspecs')
          .update({
            name: meta?.name || spec.name,
            current_version: currentVersion,
            is_public: meta?.isPublic ?? existing.is_public,
            updated_at: now
          })
          .eq('id', toolspecId);

        if (updateError) {
          throw new Error(`Failed to update toolspec: ${updateError.message}`);
        }
      } else {
        // Create new toolspec
        toolspecId = meta?.id || uuidv4();
        const newToolspec = {
          id: toolspecId,
          owner: user.id,
          name: meta?.name || spec.name,
          spec_hash: hash,
          current_version: 1,
          is_public: meta?.isPublic ?? true,
          is_seed: false,
          created_at: now,
          updated_at: now
        };

        const { error: insertError } = await this.client
          .from('toolspecs')
          .insert(newToolspec);

        if (insertError) {
          throw new Error(`Failed to create toolspec: ${insertError.message}`);
        }
      }

      // Insert new version
      const { error: versionError } = await this.client
        .from('toolspec_versions')
        .insert({
          toolspec_id: toolspecId,
          version: currentVersion,
          spec,
          notes: `Version ${currentVersion}`,
          created_at: now
        });

      if (versionError) {
        throw new Error(`Failed to create version: ${versionError.message}`);
      }

      return {
        id: toolspecId,
        owner: user.id,
        name: meta?.name || spec.name,
        specHash: hash,
        isPublic: meta?.isPublic ?? true,
        updatedAt: now,
        source: "supabase"
      };
    } catch (error) {
      console.error('Failed to save Supabase tool:', error);
      throw new Error('Failed to save tool to cloud');
    }
  }

  async delete(id: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required to delete tools');
    }

    try {
      const { error } = await this.client
        .from('toolspecs')
        .delete()
        .eq('id', id)
        .eq('owner', user.id);

      if (error) {
        throw new Error(`Failed to delete toolspec: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to delete Supabase tool:', error);
      throw new Error('Failed to delete tool');
    }
  }

  async favorite(id: string, on: boolean): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required to manage favorites');
    }

    try {
      if (on) {
        const { error } = await this.client
          .from('favorites')
          .upsert({
            user_id: user.id,
            toolspec_id: id,
            created_at: new Date().toISOString()
          });

        if (error) {
          throw new Error(`Failed to add favorite: ${error.message}`);
        }
      } else {
        const { error } = await this.client
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('toolspec_id', id);

        if (error) {
          throw new Error(`Failed to remove favorite: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Failed to update favorite:', error);
      throw new Error('Failed to update favorite');
    }
  }

  async isFavorite(id: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    try {
      const { data, error } = await this.client
        .from('favorites')
        .select('toolspec_id')
        .eq('user_id', user.id)
        .eq('toolspec_id', id)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      return false;
    }
  }

  async getFavorites(limit?: number): Promise<ToolMeta[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    try {
      let query = this.client
        .from('favorites')
        .select(`
          toolspec_id,
          toolspecs!inner (
            id,
            owner,
            name,
            spec_hash,
            is_public,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: favorites, error } = await query;

      if (error) {
        console.error('Failed to get favorites:', error);
        return [];
      }

      return (favorites || []).map((fav: any): ToolMeta => ({
        id: fav.toolspecs.id,
        owner: fav.toolspecs.owner,
        name: fav.toolspecs.name,
        specHash: fav.toolspecs.spec_hash,
        isPublic: fav.toolspecs.is_public,
        updatedAt: fav.toolspecs.updated_at,
        source: "supabase"
      }));
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }

  // Authentication methods
  async signIn(email: string, password: string): Promise<User | null> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(`Sign in failed: ${error.message}`);
    }

    this.currentUser = data.user;
    return data.user;
  }

  async signUp(email: string, password: string): Promise<User | null> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password
    });

    if (error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }

    return data.user;
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    this.currentUser = null;

    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }
}