import './app.css'
import { mount } from 'svelte'
import App from './App.svelte'

const target = document.getElementById('app')!

// DEV-only copy proof-sheet at /preview (or #preview): read every screen's text
// across ages/locales to hunt typos. `import.meta.env.DEV` is constant-folded to
// false in production builds, so the dynamic import below is tree-shaken away and
// Preview.svelte never ships to the Pi.
const wantPreview =
  import.meta.env.DEV &&
  (location.pathname.replace(/\/+$/, '') === '/preview' || location.hash.replace(/^#\/?/, '') === 'preview')

if (wantPreview) {
  import('./lib/preview/Preview.svelte').then(({ default: Preview }) => mount(Preview, { target }))
} else {
  mount(App, { target })
}
