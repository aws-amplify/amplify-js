import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Resolves module path name.
 *
 * @param {String} moduleName Module name.
 * @returns {String} Module path name;
 */
export const requireResolve = moduleName => require.resolve(moduleName);
