import tokens from '../../data/design-tokens.json';
export { tokens };
export function applyDesignTokens(root: HTMLElement = document.documentElement) {
  for (const [category, values] of Object.entries(tokens)) {
    for (const [name, value] of Object.entries(values)) root.style.setProperty(`--er-${category}-${name}`, value);
  }
}
