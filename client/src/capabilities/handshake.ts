import { STATIC_CAPABILITIES, Capability } from './registry';

// Browser API detection results
export interface BrowserCapabilities {
  canvas: boolean;
  webCodecs: boolean;
  imageDecoder: boolean;
  fileSystemAccess: boolean;
  webAssembly: boolean;
}

// Dynamic capability flags
export interface DynamicCapabilities {
  canLoadFFmpegWasm: boolean;
  canLoadPdfLibWasm: boolean;
  hasOffscreenCanvas: boolean;
}

// Combined live registry
export interface LiveRegistry {
  capabilities: Record<string, Capability>;
  browserApis: BrowserCapabilities;
  dynamic: DynamicCapabilities;
  version: string; // for cache invalidation
}

let cachedRegistry: LiveRegistry | null = null;

// Detect available browser APIs
export async function detectBrowserCapabilities(): Promise<BrowserCapabilities> {
  const canvas = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    } catch {
      return false;
    }
  })();

  const webCodecs = 'VideoEncoder' in globalThis && 'VideoDecoder' in globalThis;
  
  const imageDecoder = 'ImageDecoder' in globalThis;
  
  const fileSystemAccess = 'showOpenFilePicker' in globalThis;
  
  const webAssembly = (() => {
    try {
      return typeof WebAssembly === 'object' && 
             typeof WebAssembly.instantiate === 'function';
    } catch {
      return false;
    }
  })();

  return {
    canvas,
    webCodecs,
    imageDecoder,
    fileSystemAccess,
    webAssembly
  };
}

// Detect dynamic capabilities (lazy loading)
export async function detectDynamicCapabilities(): Promise<DynamicCapabilities> {
  // These are detected but not loaded unless needed
  const canLoadFFmpegWasm = typeof WebAssembly === 'object';
  const canLoadPdfLibWasm = typeof WebAssembly === 'object';
  const hasOffscreenCanvas = 'OffscreenCanvas' in globalThis;

  return {
    canLoadFFmpegWasm,
    canLoadPdfLibWasm,
    hasOffscreenCanvas
  };
}

// Filter capabilities based on what's actually available
function filterAvailableCapabilities(
  capabilities: Record<string, Capability>,
  browserApis: BrowserCapabilities,
  dynamic: DynamicCapabilities
): Record<string, Capability> {
  const available: Record<string, Capability> = {};

  Object.entries(capabilities).forEach(([id, capability]) => {
    let isAvailable = true;

    // Check browser API requirements
    if (capability.requires?.browserApis) {
      for (const api of capability.requires.browserApis) {
        switch (api) {
          case 'Canvas':
            if (!browserApis.canvas) isAvailable = false;
            break;
          case 'WebCodecs':
            if (!browserApis.webCodecs) isAvailable = false;
            break;
          case 'ImageDecoder':
            if (!browserApis.imageDecoder) isAvailable = false;
            break;
          case 'FileSystemAccess':
            if (!browserApis.fileSystemAccess) isAvailable = false;
            break;
          case 'WebAssembly':
            if (!browserApis.webAssembly) isAvailable = false;
            break;
        }
      }
    }

    // Check WASM requirements
    if (capability.requires?.wasm) {
      for (const wasm of capability.requires.wasm) {
        // For now, assume WASM modules can be loaded if WebAssembly is available
        if (!browserApis.webAssembly) {
          isAvailable = false;
        }
      }
    }

    // Check binary requirements (not available in browser)
    if (capability.requires?.binary) {
      isAvailable = false; // Binary executables not available in browser
    }

    if (isAvailable) {
      available[id] = capability;
    }
  });

  return available;
}

// Generate registry version for cache invalidation
function generateRegistryVersion(
  browserApis: BrowserCapabilities,
  dynamic: DynamicCapabilities
): string {
  const features = [
    browserApis.canvas ? 'canvas' : '',
    browserApis.webCodecs ? 'webcodecs' : '',
    browserApis.imageDecoder ? 'imagedecoder' : '',
    browserApis.fileSystemAccess ? 'filesystemaccess' : '',
    browserApis.webAssembly ? 'wasm' : '',
    dynamic.canLoadFFmpegWasm ? 'ffmpeg' : '',
    dynamic.canLoadPdfLibWasm ? 'pdflib' : '',
    dynamic.hasOffscreenCanvas ? 'offscreen' : ''
  ].filter(Boolean).sort().join(',');
  
  return `v1.1-${features}`;
}

// Get live registry (cached)
export async function getLiveRegistry(): Promise<LiveRegistry> {
  if (cachedRegistry) {
    return cachedRegistry;
  }

  const [browserApis, dynamic] = await Promise.all([
    detectBrowserCapabilities(),
    detectDynamicCapabilities()
  ]);

  const availableCapabilities = filterAvailableCapabilities(
    STATIC_CAPABILITIES,
    browserApis,
    dynamic
  );

  const version = generateRegistryVersion(browserApis, dynamic);

  cachedRegistry = {
    capabilities: availableCapabilities,
    browserApis,
    dynamic,
    version
  };

  return cachedRegistry;
}

// Force refresh of registry (for testing)
export function refreshLiveRegistry(): void {
  cachedRegistry = null;
}

// Get available capability IDs
export async function getAvailableCapabilityIds(): Promise<string[]> {
  const registry = await getLiveRegistry();
  return Object.keys(registry.capabilities);
}

// Check if specific capability is available
export async function isCapabilityAvailable(capabilityId: string): Promise<boolean> {
  const registry = await getLiveRegistry();
  return capabilityId in registry.capabilities;
}

// Get registry summary for LLM prompts
export async function getRegistrySummary(): Promise<{
  capabilities: Array<{id: string, accepts: string[], produces: string[], description?: string}>,
  browserSupport: string[],
  limitations: string[]
}> {
  const registry = await getLiveRegistry();
  
  const capabilities = Object.values(registry.capabilities).map(cap => ({
    id: cap.id,
    accepts: cap.accepts || [],
    produces: cap.produces || [],
    description: cap.description
  }));

  const browserSupport = [];
  if (registry.browserApis.canvas) browserSupport.push('Canvas 2D');
  if (registry.browserApis.webCodecs) browserSupport.push('WebCodecs');
  if (registry.browserApis.imageDecoder) browserSupport.push('ImageDecoder');
  if (registry.browserApis.fileSystemAccess) browserSupport.push('File System Access');
  if (registry.browserApis.webAssembly) browserSupport.push('WebAssembly');

  const limitations = [
    'Browser environment only',
    'No server-side binaries available',
    'File size limits apply'
  ];

  if (!registry.browserApis.webCodecs) {
    limitations.push('No native video encoding/decoding');
  }

  return {
    capabilities,
    browserSupport,
    limitations
  };
}