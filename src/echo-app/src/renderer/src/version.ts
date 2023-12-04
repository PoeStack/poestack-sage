import { app } from '@electron/remote'

export const SAGE_VERSION =
  import.meta.env.MODE === 'development' ? 'LOCAL_BUILD' : `v${app.getVersion()}`
