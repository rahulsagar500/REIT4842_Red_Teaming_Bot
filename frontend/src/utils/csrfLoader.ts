const getCSRFToken = (): string | undefined => {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
};

export const fetchWithCSRF = (url: string, options: RequestInit = {}): Promise<Response> => {
  const csrfToken = getCSRFToken();
  const headers = new Headers(options.headers || {});
  if (csrfToken) headers.set('X-CSRFToken', csrfToken);

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};