/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string // 应用名称
  readonly VITE_BASE_PATH: string // 应用基础路径
  readonly VITE_API_URL: string // 后端接口地址
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Navigator {
  // 麦克风
  getUserMedia: any
  readonly mozGetUserMedia: any
  readonly msGetUserMedia: any
  readonly webkitGetUserMedia: any
}
