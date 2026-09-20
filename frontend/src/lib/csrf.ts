export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const name = 'csrf_token';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}