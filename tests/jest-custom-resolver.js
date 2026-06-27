/**
 * Custom Jest resolver that uses Node's require.resolve instead of unrs-resolver.
 * Needed because unrs-resolver native binding fails to load on this machine.
 */
'use strict';

const path = require('path');
const { createRequire } = require('module');

module.exports = (request, options) => {
  // Use the defaultResolver provided by jest-config if the native unrs-resolver fails,
  // but since it also uses unrs-resolver internally, we fall back to require.resolve.
  const { basedir, extensions, defaultResolver } = options;

  // For relative paths, resolve relative to basedir
  if (request.startsWith('.') || request.startsWith('/') || /^[A-Za-z]:/.test(request)) {
    const abs = path.resolve(basedir, request);
    for (const ext of extensions || ['']) {
      const withExt = ext ? (abs.endsWith(ext) ? abs : abs + ext) : abs;
      try {
        return require.resolve(withExt);
      } catch {
        // continue
      }
    }
    try {
      return require.resolve(abs);
    } catch (e) {
      throw e;
    }
  }

  // For node modules, use require.resolve with paths option
  const req = createRequire(path.join(basedir, '__placeholder__.js'));
  return req.resolve(request);
};
