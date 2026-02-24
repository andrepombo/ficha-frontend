/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_USERNAME?: string
  readonly VITE_DEMO_PASSWORD?: string
  readonly VITE_ENABLE_DEMO_LOGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
