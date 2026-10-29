/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'browser' = the web demo build: the torso twin runs in the page (lib/twin.ts) */
  readonly VITE_TWIN?: 'browser'
}
