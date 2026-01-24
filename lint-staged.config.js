/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{[jt]sx?,json,yaml,yml}": "biome check --write --staged",
  "*.[jt]sx?": "vitest --run --changed",
};
