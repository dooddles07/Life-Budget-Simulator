import * as Sentry from "@sentry/react-native";

// No-ops until EXPO_PUBLIC_SENTRY_DSN is set (Profile > Sentry project > Client Keys),
// so this stays free/inert for local dev and anyone who hasn't opted into crash reporting.
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({ dsn, tracesSampleRate: 0 });
}

export function reportError(error: Error, context?: Record<string, unknown>): void {
  console.error("[crash]", error, context);
  if (dsn) Sentry.captureException(error, { extra: context });
}
