// Crash reporting for the partner app.
//
// Mirrors the backend (`@sentry/node`) and web (`@sentry/react`) convention:
// initialization is guarded on the DSN being present, so the app runs normally
// with reporting disabled in local dev and in any environment where the DSN is
// not configured. Nothing here throws if Sentry is unavailable.
//
// Configure via an EXPO_PUBLIC_SENTRY_DSN env var (inlined at build time) or an
// `extra.sentryDsn` value in app.json.

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const APP_ID = 'tiffo-partner';

function resolveDsn(): string | undefined {
  const fromEnv = process.env.EXPO_PUBLIC_SENTRY_DSN;
  const fromConfig = (Constants.expoConfig?.extra as { sentryDsn?: string } | undefined)?.sentryDsn;
  return fromEnv || fromConfig || undefined;
}

/**
 * Initialize crash reporting. Safe to call unconditionally — it no-ops when no
 * DSN is configured. Call once, as early as possible in app startup.
 */
export function initObservability(): void {
  const dsn = resolveDsn();
  if (!dsn) return; // reporting disabled — matches backend/web behavior

  Sentry.init({
    dsn,
    // Errors are the priority; tracing is sampled low to control cost.
    tracesSampleRate: 0.1,
    // Don't send PII by default — this app handles bank and KYC details.
    sendDefaultPii: false,
  });

  Sentry.setTag('app', APP_ID);
  const release = Constants.expoConfig?.version;
  if (release) Sentry.setTag('release', release);
}

/** Report a handled error with optional context. No-ops when disabled. */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!resolveDsn()) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
