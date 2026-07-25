// CSV export for the partner app.
//
// Backed by GET /export/orders (backend/src/routes/export.js). Note that only
// the orders export is partner-accessible — every other /export/* route is
// adminAuth-gated, so this deliberately exposes just that one.
//
// The server derives the partner from the auth token and never trusts a
// client-supplied partner id, so no identifier is sent from here.

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import api from './api';
import { captureError } from './observability';

export type OrderExportStatus = 'all' | 'active' | 'completed' | 'cancelled';

export interface ExportOptions {
  status?: OrderExportStatus;
  startDate?: string;
  endDate?: string;
}

export type ExportResult =
  | { ok: true; uri: string }
  | { ok: false; reason: 'empty' | 'unavailable' | 'failed'; message: string };

/** Filename with a timestamp so repeated exports don't overwrite each other. */
export function buildFileName(now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `tiffo-orders-${stamp}.csv`;
}

/**
 * Fetch the orders CSV, write it to cache, and hand it to the OS share sheet.
 *
 * Cache (not documents) is deliberate: these are transient exports the system
 * may reclaim, and they should not accumulate in the app's permanent storage.
 */
export async function exportOrdersCsv(options: ExportOptions = {}): Promise<ExportResult> {
  try {
    const params: Record<string, string> = {};
    if (options.status && options.status !== 'all') params.status = options.status;
    if (options.startDate) params.startDate = options.startDate;
    if (options.endDate) params.endDate = options.endDate;

    // responseType 'text' — this endpoint returns raw CSV, not JSON.
    const res = await api.get('/export/orders', { params, responseType: 'text' });

    const csv = typeof res.data === 'string' ? res.data : '';
    // A header-only or empty body means there is nothing to share; surfacing
    // that beats handing the user an empty spreadsheet.
    if (!csv.trim() || csv.trim().split('\n').length <= 1) {
      return { ok: false, reason: 'empty', message: 'No orders found for that selection.' };
    }

    const file = new File(Paths.cache, buildFileName());
    file.write(csv);

    if (!(await Sharing.isAvailableAsync())) {
      // The file exists but cannot be shared (rare; some Android configs).
      return {
        ok: false,
        reason: 'unavailable',
        message: 'Sharing is not available on this device.',
      };
    }

    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export orders',
      UTI: 'public.comma-separated-values-text',
    });

    return { ok: true, uri: file.uri };
  } catch (err: any) {
    captureError(err, { service: 'exportService', action: 'exportOrdersCsv' });
    return {
      ok: false,
      reason: 'failed',
      message: err?.response?.data?.message || 'Could not export orders. Please try again.',
    };
  }
}
