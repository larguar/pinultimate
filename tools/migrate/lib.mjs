// Helpers for tools/migrate/sections/*.mjs mappings.

/**
 * Convert a section's blocks, keeping block ids and order.
 * `convert(block)` returns the new block ({ type, settings }) or null to drop it.
 */
export function mapBlocks(section, convert) {
  const blocks = {};
  const order = [];
  for (const id of section.block_order || Object.keys(section.blocks || {})) {
    const block = section.blocks[id];
    const converted = convert(block, id);
    if (!converted) continue;
    if (block.disabled) converted.disabled = true;
    blocks[id] = converted;
    order.push(id);
  }
  return { blocks, block_order: order };
}

/** Copy the listed settings (optionally renamed: { newId: 'oldId' }), skipping undefined ones. */
export function pick(settings = {}, keys) {
  const out = {};
  const entries = Array.isArray(keys) ? keys.map((k) => [k, k]) : Object.entries(keys);
  for (const [to, from] of entries) {
    if (settings[from] !== undefined) out[to] = settings[from];
  }
  return out;
}

/** True when a Combine color setting is "unset" (it used transparent for "use default"). */
export const isUnsetColor = (value) => !value || value === 'rgba(0,0,0,0)' || value === 'transparent';
