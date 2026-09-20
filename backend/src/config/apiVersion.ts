// API Version Configuration
export const apiVersion = {
  version: '1.0.0',
  prefix: '/api/v1',
  deprecatedVersions: [],
  defaultVersion: 'v1',
};

export const getApiPrefix = (versionParam?: string) => {
  const version = versionParam || apiVersion.defaultVersion;
  return `/api/${version}`;
};