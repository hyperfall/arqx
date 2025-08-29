import { ToolSpecV1_1, validateToolSpec } from '../spec/schema';
import { tryFastLane, getDefaultFallback } from '../lib/fastlane-v1-1';
import { getLiveRegistry } from '../capabilities/handshake';
import { getAllWidgetMetadata } from '../widgets/registry';
import { getCachedPlan, setCachedPlan, generateCacheKey } from '../cache/storage';
import { getFeatureFlag } from '../config';

// Plan constraints for controlling generation
export interface PlanConstraints {
  maxMB: number;
  localOnly: boolean;
  uiModeHint?: 'live' | 'run';
}

// File metadata for planning context
export interface FileMeta {
  name: string;
  mime: string;
  size: number;
}

// Normalize user intent for consistent caching
function normalizeIntent(userText: string): string {
  return userText
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')  // normalize whitespace
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\b(please|can you|could you|would you|i want|i need|help me)\b/g, '') // remove politeness
    .trim();
}

// Check if planner API key is available
function hasPlannerApiKey(): boolean {
  // For now, always return false since we don't have LLM integration yet
  return false;
}

// Repair invalid ToolSpec by fixing common issues
function repairToolSpec(spec: any): ToolSpecV1_1 {
  // Start with a basic valid structure
  const repaired: ToolSpecV1_1 = {
    version: '1',
    name: spec.name || 'Generated Tool',
    summary: spec.summary || spec.description || 'Tool generated from user input',
    inputs: [],
    pipeline: [],
    output: { type: 'none' }
  };

  // Fix inputs array
  if (Array.isArray(spec.inputs)) {
    repaired.inputs = spec.inputs.map((input: any) => ({
      id: input.id || 'input1',
      label: input.label || input.id || 'Input',
      type: ['file', 'file[]', 'text', 'number', 'boolean', 'select'].includes(input.type) ? input.type : 'text',
      accept: input.accept && Array.isArray(input.accept) ? input.accept : undefined,
      maxMB: typeof input.maxMB === 'number' ? input.maxMB : undefined,
      default: input.default
    }));
  }

  // Fix pipeline array
  if (Array.isArray(spec.pipeline)) {
    repaired.pipeline = spec.pipeline.map((op: any) => ({
      op: op.op || 'text.format',
      args: op.args || {}
    }));
  }

  // Fix output
  if (spec.output && typeof spec.output === 'object') {
    repaired.output = {
      type: ['file', 'file[]', 'text', 'json', 'none'].includes(spec.output.type) ? spec.output.type : 'none',
      naming: spec.output.naming,
      zip: spec.output.zip
    };
  }

  // Fix UI
  if (spec.ui && typeof spec.ui === 'object') {
    repaired.ui = {
      mode: ['live', 'run'].includes(spec.ui.mode) ? spec.ui.mode : 'run',
      layout: spec.ui.layout,
      widgets: Array.isArray(spec.ui.widgets) ? spec.ui.widgets : undefined
    };
  }

  return repaired;
}

// Validate and repair ToolSpec
export function validateOrRepair(spec: any): ToolSpecV1_1 {
  try {
    return validateToolSpec(spec);
  } catch (error) {
    console.warn('ToolSpec validation failed, attempting repair:', error);
    const repaired = repairToolSpec(spec);
    
    try {
      return validateToolSpec(repaired);
    } catch (repairError) {
      console.warn('ToolSpec repair also failed, using safe fallback');
      return getDefaultFallback('User input');
    }
  }
}

// Stub LLM planner (to be implemented when API integration is added)
async function callLLMPlanner(params: {
  userText: string;
  filesMeta: FileMeta[];
  constraints: PlanConstraints;
  registry: any;
  widgets: any[];
}): Promise<any> {
  // This is a stub implementation
  // In the real version, this would call an LLM API with structured prompts
  
  throw new Error('LLM planner not implemented - using fast-lane fallback');
}

// Delta update for iterative refinements
export async function deltaUpdate(
  currentSpec: ToolSpecV1_1,
  userChange: string
): Promise<ToolSpecV1_1> {
  // For now, just return the current spec
  // In a full implementation, this would make minimal updates based on the change request
  return currentSpec;
}

// Main planner function
export async function planToolSpec(
  userText: string,
  filesMeta: FileMeta[] = [],
  constraints: PlanConstraints = {
    maxMB: 100,
    localOnly: true,
    uiModeHint: 'run'
  }
): Promise<ToolSpecV1_1> {
  try {
    // 1) Try fast-lane templates first
    const fastResult = tryFastLane(userText);
    if (fastResult) {
      return fastResult;
    }

    // 2) Check cache for this request
    const normalizedIntent = normalizeIntent(userText);
    const registry = await getLiveRegistry();
    const cacheKey = await generateCacheKey(normalizedIntent, registry.version, constraints);
    
    const cachedSpec = await getCachedPlan(cacheKey);
    if (cachedSpec) {
      return validateOrRepair(cachedSpec);
    }

    // 3) If no API key available, use fallback
    if (!getFeatureFlag('plannerLLM') || !hasPlannerApiKey()) {
      const fallback = getDefaultFallback(userText);
      
      // Cache the fallback for next time
      await setCachedPlan(
        cacheKey,
        userText,
        normalizedIntent,
        registry.version,
        constraints,
        fallback
      );
      
      return fallback;
    }

    // 4) Call LLM planner with full context
    const widgets = getAllWidgetMetadata();
    const llmResult = await callLLMPlanner({
      userText,
      filesMeta,
      constraints,
      registry: registry.capabilities,
      widgets
    });

    // 5) Validate and repair result
    const validatedSpec = validateOrRepair(llmResult);

    // 6) Cache the result
    await setCachedPlan(
      cacheKey,
      userText,
      normalizedIntent,
      registry.version,
      constraints,
      validatedSpec
    );

    return validatedSpec;

  } catch (error) {
    console.warn('Planner failed, using default fallback:', error);
    return getDefaultFallback(userText);
  }
}

// Get explanation of a plan (from notes field)
export function explainPlan(spec: ToolSpecV1_1): string[] {
  return spec.notes || ['No explanation available for this tool.'];
}

// Check if a spec is from fast-lane templates
export function isFromFastLane(spec: ToolSpecV1_1): boolean {
  return !spec.notes || !spec.notes.some(note => note.includes('LLM'));
}

// Get planning status for UI
export function getPlanningStatus(): {
  fastLaneAvailable: boolean;
  llmAvailable: boolean;
  cacheAvailable: boolean;
} {
  return {
    fastLaneAvailable: true,
    llmAvailable: getFeatureFlag('plannerLLM') && hasPlannerApiKey(),
    cacheAvailable: true
  };
}