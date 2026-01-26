/**
 * Shared fetch helper that prevents empty error objects
 * and provides consistent error handling
 */
export async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<{ data: T; requestId: string }> {
  const res = await fetch(input, init);
  const requestId = res.headers.get('x-request-id') ?? 'unknown';
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    const msg = json?.error?.message ?? text ?? `HTTP ${res.status}`;
    const code = json?.error?.code ?? `HTTP_${res.status}`;
    throw new Error(
      `[apiFetch] ${code} ${res.status} requestId=${requestId} message=${msg}`
    );
  }

  return { data: json as T, requestId };
}
