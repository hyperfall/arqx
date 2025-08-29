import { z } from 'zod';

// Capability requirement schemas
const WasmRequirement = z.object({
  name: z.string()
});

const BrowserApiRequirement = z.enum([
  'Canvas',
  'WebCodecs', 
  'ImageDecoder',
  'FileSystemAccess',
  'WebAssembly'
]);

const BinaryRequirement = z.object({
  name: z.enum(['ffmpeg', 'qpdf', 'gs', 'soffice', 'tesseract'])
});

const CapabilityRequirements = z.object({
  wasm: z.array(WasmRequirement).optional(),
  browserApis: z.array(BrowserApiRequirement).optional(),
  binary: z.array(BinaryRequirement).optional()
});

const CapabilityLimits = z.object({
  maxMB: z.number().positive().optional(),
  maxFiles: z.number().positive().optional(),
  maxDuration: z.number().positive().optional() // seconds
});

// Main Capability schema
const CapabilitySchema = z.object({
  id: z.string(),
  accepts: z.array(z.string()).optional(), // MIME types
  produces: z.array(z.string()).optional(), // MIME types  
  env: z.array(z.enum(['browser', 'server'])),
  argsSchema: z.any(), // ZodTypeAny
  requires: CapabilityRequirements.optional(),
  limits: CapabilityLimits.optional(),
  description: z.string().optional()
});

export type Capability = z.infer<typeof CapabilitySchema>;
export type CapabilityRequirement = z.infer<typeof CapabilityRequirements>;

// Static capability registry - browser-only implementations
export const STATIC_CAPABILITIES: Record<string, Capability> = {
  // Image operations
  'image.decode': {
    id: 'image.decode',
    accepts: ['image/*'],
    produces: ['image/bitmap'],
    env: ['browser'],
    argsSchema: z.object({}),
    requires: { browserApis: ['Canvas'] },
    limits: { maxMB: 50 },
    description: 'Decode image to bitmap data'
  },

  'image.resize': {
    id: 'image.resize',
    accepts: ['image/*'],
    produces: ['image/*'],
    env: ['browser'],
    argsSchema: z.object({
      maxWidth: z.number().positive().optional(),
      maxHeight: z.number().positive().optional(),
      fit: z.enum(['contain', 'cover', 'fill']).default('contain')
    }),
    requires: { browserApis: ['Canvas'] },
    limits: { maxMB: 50 }
  },

  'image.to_jpeg': {
    id: 'image.to_jpeg',
    accepts: ['image/*'],
    produces: ['image/jpeg'],
    env: ['browser'],
    argsSchema: z.object({
      quality: z.number().min(0).max(1).default(0.9),
      stripExif: z.boolean().default(false)
    }),
    requires: { browserApis: ['Canvas'] },
    limits: { maxMB: 50 }
  },

  'image.to_png': {
    id: 'image.to_png',
    accepts: ['image/*'],
    produces: ['image/png'],
    env: ['browser'],
    argsSchema: z.object({}),
    requires: { browserApis: ['Canvas'] }
  },

  'image.to_webp': {
    id: 'image.to_webp',
    accepts: ['image/*'],
    produces: ['image/webp'],
    env: ['browser'],
    argsSchema: z.object({
      quality: z.number().min(0).max(1).default(0.9)
    }),
    requires: { browserApis: ['Canvas'] }
  },

  // GIF operations
  'gif.decode': {
    id: 'gif.decode',
    accepts: ['image/gif'],
    produces: ['image/*'],
    env: ['browser'],
    argsSchema: z.object({}),
    requires: { browserApis: ['Canvas'] }
  },

  'frames.sample': {
    id: 'frames.sample',
    accepts: ['image/*'],
    produces: ['image/*'],
    env: ['browser'],
    argsSchema: z.object({
      every: z.number().positive().default(1)
    }),
    requires: { browserApis: ['Canvas'] }
  },

  // PDF operations (stub implementations)
  'pdf.merge': {
    id: 'pdf.merge',
    accepts: ['application/pdf'],
    produces: ['application/pdf'],
    env: ['browser'],
    argsSchema: z.object({}),
    limits: { maxMB: 100, maxFiles: 10 },
    description: 'Merge multiple PDF files (stub implementation)'
  },

  'pdf.split': {
    id: 'pdf.split',
    accepts: ['application/pdf'],
    produces: ['application/pdf'],
    env: ['browser'],
    argsSchema: z.object({
      pages: z.string().optional() // "1-5,8,10-12"
    }),
    limits: { maxMB: 100 }
  },

  'pdf.compress': {
    id: 'pdf.compress',
    accepts: ['application/pdf'],
    produces: ['application/pdf'],
    env: ['browser'],
    argsSchema: z.object({
      targetMB: z.number().positive().optional()
    }),
    limits: { maxMB: 100 }
  },

  // Data format conversions
  'csv.to_json': {
    id: 'csv.to_json',
    accepts: ['text/csv'],
    produces: ['application/json'],
    env: ['browser'],
    argsSchema: z.object({
      delimiter: z.string().default(','),
      hasHeader: z.boolean().default(true),
      encoding: z.string().default('utf-8')
    }),
    limits: { maxMB: 25 }
  },

  'json.to_csv': {
    id: 'json.to_csv',
    accepts: ['application/json'],
    produces: ['text/csv'],
    env: ['browser'],
    argsSchema: z.object({
      delimiter: z.string().default(','),
      includeHeader: z.boolean().default(true)
    }),
    limits: { maxMB: 25 }
  },

  // Text operations
  'text.format': {
    id: 'text.format',
    accepts: ['text/*'],
    produces: ['text/*'],
    env: ['browser'],
    argsSchema: z.object({
      case: z.enum(['upper', 'lower', 'title', 'sentence']).optional(),
      trim: z.boolean().default(false),
      wrapAt: z.number().positive().optional()
    }),
    limits: { maxMB: 10 }
  }
};

// Get all capability IDs
export function getCapabilityIds(): string[] {
  return Object.keys(STATIC_CAPABILITIES);
}

// Get capability by ID
export function getCapability(id: string): Capability | undefined {
  return STATIC_CAPABILITIES[id];
}

// Filter capabilities by what they accept/produce
export function findCapabilities(accepts?: string[], produces?: string[]): Capability[] {
  return Object.values(STATIC_CAPABILITIES).filter(cap => {
    const matchesAccepts = !accepts || accepts.some(mime => 
      cap.accepts?.some(accept => 
        accept === mime || accept === mime.split('/')[0] + '/*' || accept === '*/*'
      )
    );
    
    const matchesProduces = !produces || produces.some(mime =>
      cap.produces?.some(produce =>
        produce === mime || produce === mime.split('/')[0] + '/*' || produce === '*/*'
      )
    );

    return matchesAccepts && matchesProduces;
  });
}

// Validate capability arguments
export function validateCapabilityArgs(capabilityId: string, args: any): any {
  const capability = getCapability(capabilityId);
  if (!capability) {
    throw new Error(`Unknown capability: ${capabilityId}`);
  }
  
  return capability.argsSchema.parse(args);
}