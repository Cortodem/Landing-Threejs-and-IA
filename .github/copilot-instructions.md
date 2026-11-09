# Copilot instructions

## Project structure and architecture

- This is a static, vanilla HTML/CSS/JavaScript site with multiple independent pages and experiments; there is no application framework or build pipeline.
- `index.html` is the main experience. It contains the navigation, department panels, inline content data/templates, and panel/carousel interactions. `main.js` builds the Three.js scene, loads the local textures and sound, and connects scroll-driven camera movement and raycastable doors to the department IDs (`clases`, `personal`, `jefes`, `premios`).
- Keep the IDs and section names aligned between `index.html` and `main.js`: the scroll navigation, door `userData.id` values, and panel selectors all depend on them. The root-page content is generated from arrays in the inline script; update the relevant data/template there when changing those cards.
- `info.html` is a separate, simpler information-page implementation with its own inline content and `style-info.css`; do not assume it shares the root page's data or interactions.
- `holamindo/`, `ppp.html`, and `carpeta auxiliar/` contain standalone prototypes or auxiliary content. Keep changes scoped to the relevant page rather than treating them as modules of the main experience.
- `design.md` describes the intended gothic-digital visual system: dark backgrounds, gold accents, Cinzel-style headings, and subtle glow/hover treatments. Preserve that visual language when changing the main site.

## Dependencies and local preview

- `index.html` runs `main.js` as a browser ES module. Its import map resolves the bare `three` and GSAP imports from CDNs; GSAP and ScrollTrigger are also loaded as global scripts. Keep these browser entry points consistent when changing imports or versions.
- Three.js textures and audio are loaded using paths relative to the repository root (for example, `assets/textures/` and `assets/sounds/`). Preserve those paths when moving or adding assets.
- Serve the repository over HTTP to preview module-based pages; opening `index.html` directly with `file://` does not provide a reliable module/import-map runtime. For example: `python -m http.server 8000`, then open `http://localhost:8000/`.

## Build, test, and lint

- There are no build or lint scripts configured in `package.json`.
- `npm test` is only a placeholder that prints an error and exits with status 1; no automated test runner or single-test command is configured.
- For UI changes, preview the affected page in a browser and check its console, especially for module/CDN loading, missing asset paths, and interactions that cross between the 3D scene and department panels.

## Code conventions specific to this repository

- Browser code is mostly plain JavaScript. `main.js` is an ES module even though `package.json` declares CommonJS; its browser entry is controlled by `type="module"` and the import map in `index.html`.
- Main-scene meshes that should respond to pointer interaction carry a `userData.id`; preserve that ID through scene changes and keep it mapped to a matching department section.
- Reuse shared Three.js geometry and materials for repeated scene elements, as the main scene does for door components.
- Page content and navigation labels are primarily Spanish. Keep user-facing copy and related IDs consistent with the existing page.
