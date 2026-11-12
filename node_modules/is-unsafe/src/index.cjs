// CommonJS shim — generated from src/index.js
// For bundlers and Node.js environments that require CJS interop.
// This file re-exports via dynamic import to bridge ESM → CJS.

let _mod;
async function _load() {
  if (!_mod) _mod = await import('./index.js');
  return _mod;
}

// Synchronous-style exports via module.exports proxy
// (Works for environments that await the module, e.g. Jest with transformIgnorePatterns)
module.exports = new Proxy(
  {},
  {
    get(_, key) {
      throw new Error(
        `is-unsafe: CommonJS require() is not fully supported. ` +
        `Use dynamic import(): const { isUnsafe } = await import('is-unsafe'). ` +
        `Or set "type": "module" in your package.json.`
      );
    },
  }
);

// Export the loader for async CJS callers
module.exports.load = _load;
