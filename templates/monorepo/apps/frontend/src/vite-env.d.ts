/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * API URL for the backend server.
   * Default: http://localhost:3000
   */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
