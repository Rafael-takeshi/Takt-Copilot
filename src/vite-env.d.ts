/// <reference types="vite/client" />

declare module "*.ico?url" {
  const src: string;
  export default src;
}