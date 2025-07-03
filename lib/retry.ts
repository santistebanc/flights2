export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries: number;
    delayMs?: number;
    onError?: (err: unknown, attempt: number) => void;
  } = { retries: 3 }
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= options.retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (options.onError) options.onError(err, attempt);
      if (attempt < options.retries && options.delayMs) {
        await new Promise((res) => setTimeout(res, options.delayMs));
      }
    }
  }
  throw lastError;
}
