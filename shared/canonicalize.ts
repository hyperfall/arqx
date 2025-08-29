import type { ToolSpec } from "./types";

/**
 * Recursively sort object keys for deterministic serialization
 */
function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  const sorted: any = {};
  Object.keys(obj)
    .sort()
    .forEach(key => {
      sorted[key] = sortObjectKeys(obj[key]);
    });
  
  return sorted;
}

/**
 * Canonicalize a ToolSpec for stable hashing
 * Ensures deterministic JSON serialization by sorting object keys recursively
 */
export function canonicalize(spec: ToolSpec): string {
  const normalized = sortObjectKeys(spec);
  return JSON.stringify(normalized);
}

/**
 * Generate a deterministic hash for a ToolSpec
 * Used for deduplication and versioning
 * Uses browser crypto API for SHA-256 hashing
 */
export async function specHash(spec: ToolSpec): Promise<string> {
  const canonical = canonicalize(spec);
  const data = new TextEncoder().encode(canonical);
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Use browser crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback to simple hash for non-browser environments
    let hash = 0;
    for (let i = 0; i < canonical.length; i++) {
      const char = canonical.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Validate ToolSpec structure
 */
export function isValidToolSpec(obj: any): obj is ToolSpec {
  return (
    obj &&
    typeof obj === "object" &&
    obj.version === "1" &&
    typeof obj.name === "string" &&
    typeof obj.summary === "string" &&
    Array.isArray(obj.inputs) &&
    Array.isArray(obj.pipeline) &&
    obj.output &&
    typeof obj.output === "object" &&
    ["file", "file[]", "text", "json"].includes(obj.output.type)
  );
}