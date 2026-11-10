/** Разбор ошибки API админки для toast/alert. */
export async function readApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data?.error?.trim()) return data.error.trim();
  } catch {
    /* ignore */
  }
  return `Ошибка сервера (${response.status})`;
}

export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
  return response;
}
