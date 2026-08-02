// Single seam for wiring a real crash-reporting service (Sentry, Bugsnag, ...)
// later without touching call sites. Console-only until one is configured.
export function reportError(error: Error, context?: Record<string, unknown>): void {
  console.error("[crash]", error, context);
}
