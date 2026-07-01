export const getRuntimeConfigValue = (runtimeKey, viteKey, fallback = '') =>
  String(window.ENV_CONFIG?.[runtimeKey] || import.meta.env[viteKey] || fallback).trim()

export const getGoogleClientId = () => getRuntimeConfigValue('GOOGLE_CLIENT_ID', 'VITE_GOOGLE_CLIENT_ID')
