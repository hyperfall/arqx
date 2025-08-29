// Widget-based UI system types for ToolSpec v1.1
export type ToolSpecUI = {
  mode?: "live" | "run";              // default "run"; "live" hides Run row
  layout?: {
    main: string[];                   // widget ids in render order
    inspector?: string[];             // optional side widgets
  };
  widgets?: Array<{
    id: string;                       // unique per tool
    type: string;                     // e.g., "viewer.pdf", "viewer.image", "panel.fileDetails"
    title?: string;
    bindings?: Record<string, string>; // map widget props → ids in spec.inputs or preview stream
    options?: Record<string, any>;     // free-form widget opts
  }>;
};

// Core ToolSpec v1 data model
export type ToolSpec = {
  version: "1";
  name: string;
  summary: string;
  inputs: any[];
  pipeline: Array<{
    op: string;
    args?: Record<string, any>;
  }>;
  output: {
    type: "file" | "file[]" | "text" | "json" | "none";
    naming?: string;
    zip?: boolean;
  };
  suggested_extras?: string[];
  ui?: ToolSpecUI; // v1.1 extension
};

// Repository metadata
export type ToolMeta = {
  id: string;
  owner?: string | null;
  name: string;
  specHash: string;
  isPublic: boolean;
  updatedAt: string;
  source: "local" | "supabase";
};

// Repository interface
export interface ToolRepo {
  get(id: string): Promise<{ spec: ToolSpec; meta: ToolMeta } | null>;
  list(params?: {
    limit?: number;
    ownerOnly?: boolean;
    query?: string;
  }): Promise<ToolMeta[]>;
  save(spec: ToolSpec, meta?: Partial<ToolMeta>): Promise<ToolMeta>;
  delete(id: string): Promise<void>;
  favorite(id: string, on: boolean): Promise<void>;
}

// Local storage types
export type LocalToolSpec = {
  id: string; // format: "local:<uuid>"
  spec: ToolSpec;
  meta: {
    name: string;
    updatedAt: string;
    isPublic: boolean;
  };
};

export type StoredArtifact = {
  id: string;
  data: Blob;
  createdAt: string;
  lastAccessed: string;
  size: number;
};

// Supabase schema types
export type Profile = {
  id: string;
  email: string;
  created_at: string;
};

export type ToolSpecRecord = {
  id: string;
  owner: string;
  name: string;
  spec_hash: string;
  current_version: number;
  is_public: boolean;
  is_seed: boolean;
  created_at: string;
  updated_at: string;
};

export type ToolSpecVersion = {
  id: number;
  toolspec_id: string;
  version: number;
  spec: ToolSpec;
  notes?: string;
  created_at: string;
};

export type Favorite = {
  user_id: string;
  toolspec_id: string;
};

// Configuration flags
export type FeatureFlags = {
  supabaseOn: boolean;
  serverFallback: boolean;
  plannerLLM: boolean;
  localOnlyMode: boolean;
};