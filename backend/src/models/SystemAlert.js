const mongoose = require('mongoose');

/**
 * SystemAlert — persistent record of platform notifications surfaced on the
 * admin System Alerts screen. Acknowledgment state lives here (not in React
 * component state) so it survives page refreshes and server restarts.
 *
 * Two kinds of alerts share this collection:
 *   1. Derived alerts — recomputed on every dashboard load from live counts
 *      (pending partners, open fraud reports, open support requests). These are
 *      upserted by their stable `key` so their acknowledged flag persists while
 *      their message/count stays current; they self-resolve when the underlying
 *      condition clears.
 *   2. Ad-hoc alerts — logged directly (e.g. by background jobs) with no `key`.
 */
const systemAlertSchema = new mongoose.Schema(
  {
    // Stable natural key for derived alerts (e.g. 'pending-partners'). Absent
    // for one-off logged alerts. Sparse-unique so multiple keyless alerts coexist.
    key: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
    source: {
      type: String,
      trim: true,
      default: 'System',
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedAt: {
      type: Date,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('SystemAlert', systemAlertSchema);
