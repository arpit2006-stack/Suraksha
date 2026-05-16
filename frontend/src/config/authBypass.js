/** Dev-only URL bypass while DB/auth API is offline. Remove or lock down in production. */
export const AUTH_BYPASS_CODE = import.meta.env.VITE_AUTH_BYPASS_CODE || 'suraksha-dev';

export function isValidBypassCode(code) {
  return Boolean(code) && code === AUTH_BYPASS_CODE;
}
