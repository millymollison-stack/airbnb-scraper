# CSS Principles (from David Mollison)

## Key Principle: External CSS over inline/embedded styles
- CSS should ALWAYS be in separate `.css` files, never inline in HTML/JSX
- Inline styles are not scalable, not reusable, and hard to maintain
- Always create a separate `.css` file for component styles
- This applies to React components, plain HTML, everything

## Typography Scale (from David)
```css
.h1 {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 400;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.h2 {
  font-size: 1.1rem;
  text-decoration: none;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: 600;
}

.h3 {
  margin-bottom: 30px;
  font-size: 1.1rem;
  font-weight: 300;
  font-style: normal;
  text-transform: capitalize;
  line-height: 1.5;
}

.h4 {
  font-size: 0.8rem;
  line-height: 1.5;
  text-transform: capitalize;
}
```

_Learned: April 10, 2026 — David hates CSS inside HTML/JSX. Always use external stylesheets._
