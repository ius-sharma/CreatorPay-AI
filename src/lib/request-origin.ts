export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    const supplied = new URL(origin);
    // Next's internal request URL can use localhost even when a browser uses
    // 127.0.0.1. The actual Host header is the browser's destination authority.
    const host = req.headers.get('host') || new URL(req.url).host;
    return ['http:', 'https:'].includes(supplied.protocol) && supplied.host.toLowerCase() === host.toLowerCase();
  } catch { return false; }
}
