import { z } from 'zod';

// ToolSpec v1.1 Input Schema
export const InputSpecSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  type: z.enum(['file', 'file[]', 'text', 'number', 'boolean', 'select']),
  accept: z.array(z.string()).optional(), // MIME types for file inputs
  maxMB: z.number().positive().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional(),
  default: z.any().optional(),
  placeholder: z.string().optional()
});

// Pipeline Operation Schema
export const PipelineOpSchema = z.object({
  op: z.string(),
  args: z.record(z.any()).optional()
});

// Output Schema
export const OutputSpecSchema = z.object({
  type: z.enum(['file', 'file[]', 'text', 'json', 'none']),
  naming: z.string().optional(),
  zip: z.boolean().optional()
});

// Widget Schema
export const WidgetSpecSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string().optional(),
  bindings: z.record(z.string()).optional(), // e.g. {file:"@pdf"}
  options: z.record(z.any()).optional()
});

// UI Layout Schema
export const UISpecSchema = z.object({
  mode: z.enum(['live', 'run']).optional().default('run'),
  layout: z.object({
    main: z.array(z.string()),
    inspector: z.array(z.string()).optional()
  }).optional(),
  widgets: z.array(WidgetSpecSchema).optional()
});

// Main ToolSpec v1.1 Schema
export const ToolSpecV1_1Schema = z.object({
  version: z.literal('1'),
  name: z.string(),
  summary: z.string(),
  inputs: z.array(InputSpecSchema),
  pipeline: z.array(PipelineOpSchema),
  output: OutputSpecSchema,
  ui: UISpecSchema.optional(),
  suggested_extras: z.array(z.string()).optional(),
  notes: z.array(z.string()).optional() // for explainability
});

// TypeScript types derived from schemas
export type InputSpec = z.infer<typeof InputSpecSchema>;
export type PipelineOp = z.infer<typeof PipelineOpSchema>;
export type OutputSpec = z.infer<typeof OutputSpecSchema>;
export type WidgetSpec = z.infer<typeof WidgetSpecSchema>;
export type UISpec = z.infer<typeof UISpecSchema>;
export type ToolSpecV1_1 = z.infer<typeof ToolSpecV1_1Schema>;

// Validation helpers
export function validateToolSpec(spec: unknown): ToolSpecV1_1 {
  return ToolSpecV1_1Schema.parse(spec);
}

export function isValidToolSpec(spec: unknown): spec is ToolSpecV1_1 {
  return ToolSpecV1_1Schema.safeParse(spec).success;
}

// Legacy compatibility - convert old ToolSpec to v1.1 format
export function upgradeToV1_1(oldSpec: any): ToolSpecV1_1 {
  // Handle legacy format conversion
  const upgraded: ToolSpecV1_1 = {
    version: '1',
    name: oldSpec.name || 'Untitled Tool',
    summary: oldSpec.description || oldSpec.name || 'Tool',
    inputs: [],
    pipeline: [],
    output: { type: 'none' }
  };

  // Convert old inputs format
  if (oldSpec.inputs) {
    if (oldSpec.inputs.accept && Array.isArray(oldSpec.inputs.accept)) {
      upgraded.inputs.push({
        id: 'files',
        label: 'Input Files',
        type: oldSpec.inputs.multiple ? 'file[]' : 'file',
        accept: oldSpec.inputs.accept,
        maxMB: oldSpec.inputs.maxSize ? oldSpec.inputs.maxSize / (1024 * 1024) : undefined
      });
    }
  }

  // Convert old settings to inputs
  if (oldSpec.settings && typeof oldSpec.settings === 'object') {
    Object.entries(oldSpec.settings).forEach(([key, setting]: [string, any]) => {
      const input: InputSpec = {
        id: key,
        label: setting.label || key,
        type: setting.type === 'slider' ? 'number' : 
              setting.type === 'checkbox' ? 'boolean' :
              setting.type === 'select' ? 'select' : 'text',
        default: setting.default
      };

      if (setting.type === 'slider') {
        input.min = setting.min;
        input.max = setting.max;
        input.step = setting.step;
      }

      if (setting.type === 'select' && setting.options) {
        input.options = setting.options.map((opt: string) => ({
          label: opt,
          value: opt
        }));
      }

      upgraded.inputs.push(input);
    });
  }

  // Detect if this should be a live mode based on presence of widgets
  if (oldSpec.ui?.widgets && oldSpec.ui.widgets.length > 0) {
    upgraded.ui = {
      mode: 'live',
      layout: oldSpec.ui.layout || { main: oldSpec.ui.widgets.map((w: any) => w.id) },
      widgets: oldSpec.ui.widgets
    };
  }

  return upgraded;
}