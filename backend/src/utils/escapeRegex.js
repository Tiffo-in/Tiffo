/**
 * Escapes a string to be safely used within a RegExp.
 * Prevents ReDoS (Regular Expression Denial of Service) and regex injection.
 * @param {string} string The string to escape.
 * @returns {string} The escaped string.
 */
function escapeRegex(string) {
  if (typeof string !== 'string') return string;
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = escapeRegex;
