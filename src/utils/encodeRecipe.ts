import LZString from 'lz-string';
import type { Recipe } from '../store/usePDFStore';

/**
 * Encodes a Recipe object into a compressed Base64 string for URL sharing.
 */
export function encodeRecipe(recipe: Recipe): string {
  const json = JSON.stringify({
    name: recipe.name,
    steps: recipe.steps.map(s => ({
      toolId: s.toolId,
      options: s.options
    }))
  });
  
  return LZString.compressToEncodedURIComponent(json);
}

/**
 * Decodes a compressed Base64 string back into a Recipe object.
 * Does not include the ID, as that should be generated locally.
 */
export function decodeRecipe(encoded: string): Partial<Recipe> | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (!decompressed) return null;
    
    return JSON.parse(decompressed);
  } catch (error) {
    console.error('Failed to decode recipe:', error);
    return null;
  }
}
