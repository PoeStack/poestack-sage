export const SAGE_VERSION =
  import.meta.env.MODE === 'development' ? 'LOCAL_BUILD' : `v${process.env.npm_package_version}`
