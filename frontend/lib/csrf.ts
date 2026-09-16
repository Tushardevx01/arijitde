function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.split('; ').find((row) => row.startsWith('csrf_token='));
  return match ? match.split('=')[1] : '';
}

export async function csrfFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const csrfToken = getCsrfToken();
  if (csrfToken && !headers.has('x-csrf-token')) {
    headers.set('x-csrf-token', csrfToken);
  }
  return fetch(url, { ...init, headers });
}
