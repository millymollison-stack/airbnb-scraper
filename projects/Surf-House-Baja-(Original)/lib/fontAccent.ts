// Shared font accent utility — used by ColorPicker and any other component
// that needs to apply a heading font across the site.

export const FONT_OPTIONS = [
  'Playfair Display',
  'Cormorant Garamond',
  'DM Serif Display',
  'Fraunces',
  'Space Grotesk',
  'Josefin Sans',
  'Archivo Black',
  'Abril Fatface',
  'Righteous',
  'Pacifico',
];

export function saveFontAccent(font: string) {
  localStorage.setItem('site-font-accent', font);
  applyFontAccent(font);
}

export function applyFontAccent(font: string) {
  // Set CSS var on :root
  document.documentElement.style.setProperty('--font-accent', `'${font}', serif`);
  // Apply directly to all h1 elements for immediate effect
  document.querySelectorAll('h1').forEach(el => {
    (el as HTMLElement).style.fontFamily = `'${font}', serif`;
  });
}

export function loadFontAccent() {
  const saved = localStorage.getItem('site-font-accent');
  if (saved && FONT_OPTIONS.includes(saved)) {
    applyFontAccent(saved);
    return saved;
  }
  return 'Playfair Display';
}
