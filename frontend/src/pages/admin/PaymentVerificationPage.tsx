import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { formatPrice, formatDateTime } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  AlertTriangle,
  Building2,
  User,
  Clock,
  X,
} from 'lucide-react';

export const PaymentVerificationPage: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  // Selected submission for review modal
  const [activeSubmission, setActiveSubmission] = useState<any>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVerificationQueue();
      if (res.success) {
        setQueue(res.data);
      }
    } catch (err: any) {
      error('Failed to load queue', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleApprove = async (submission: any) => {
    if (!window.confirm(`Confirm receipt of ${formatPrice(submission.submittedAmount || submission.order?.totalAmount)} in Magnificent bank ledger for order ${submission.order?.orderNumber}?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.verifyPayment({
        submissionId: submission.id,
        action: 'approve',
      });
      if (res.success) {
        success('Payment Confirmed', `Order ${submission.order?.orderNumber} has been verified and confirmed.`);
        setActiveSubmission(null);
        loadQueue();
      }
    } catch (err: any) {
      error('Verification Error', err.message || 'Failed to approve payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 4) {
      error('Mandatory Reason', 'Please enter a clear reason of at least 4 characters explaining the rejection.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.verifyPayment({
        submissionId: activeSubmission.id,
        action: 'reject',
        rejectionReason: rejectionReason.trim(),
      });
      if (res.success) {
        success('Receipt Rejected', `Order ${activeSubmission.order?.orderNumber} marked as rejected with reason.`);
        setIsRejectModalOpen(false);
        setActiveSubmission(null);
        setRejectionReason('');
        loadQueue();
      }
    } catch (err: any) {
      error('Rejection Error', err.message || 'Failed to reject payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
            Payment Verification Queue
          </h1>
          <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
            Audit manual bank wire receipts against corporate ledger
          </p>
        </div>

        <button
          onClick={loadQueue}
          className="px-4 py-2 bg-white border border-stone text-xs uppercase tracking-editorial font-medium hover:border-espresso-900 transition-colors"
        >
          Refresh Queue ({queue.length})
        </button>
      </div>

      {/* Advisory Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Security Protocol:</strong> A customer-uploaded receipt is evidence of transfer, not absolute confirmation that funds have cleared. Always verify that the exact order sum has settled in the Magnificent corporate bank statement before approving.
        </p>
      </div>

      {/* Queue Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-charcoal tracking-editorial uppercase">
          Loading pending payment queue...
        </div>
      ) : queue.length === 0 ? (
        <div className="bg-white border border-stone p-16 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
          <h2 className="font-serif text-2xl text-espresso-900 font-medium">All Clear</h2>
          <p className="text-xs text-charcoal max-w-sm mx-auto font-light leading-relaxed">
            There are currently no customer bank receipts awaiting review. New uploads will appear in this queue automatically.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 text-charcoal uppercase tracking-editorial text-[10px] font-semibold border-b border-stone/50">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Expected Total</th>
                  <th className="py-3 px-4">Submitted Amount</th>
                  <th className="py-3 px-4">Bank Ref / Narration</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/40">
                {queue.map((sub) => (
                  <tr key={sub.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-espresso-900">
                      {sub.order?.orderNumber || sub.orderId}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-espresso-900">{sub.order?.customerName}</p>
                      <p className="text-[10px] text-charcoal/70">{sub.order?.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-espresso-900">
                      {formatPrice(sub.order?.totalAmount)}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-emerald-800">
                      {formatPrice(sub.submittedAmount || sub.order?.totalAmount)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-charcoal">
                      {sub.paymentReference || 'None supplied'}
                    </td>
                    <td className="py-3 px-4 text-stone-muted font-mono text-[10px]">
                      {formatDateTime(sub.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setActiveSubmission(sub)}
                        className="px-3 py-1.5 bg-espresso-900 hover:bg-espresso-800 text-ivory-100 text-[11px] uppercase tracking-editorial font-medium inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side-by-Side Review Modal */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-espresso-900/80 backdrop-blur-xs" onClick={() => setActiveSubmission(null)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-stone shadow-2xl flex flex-col z-10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone flex justify-between items-center bg-ivory-50">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-charcoal font-mono">
                  Receipt Verification Review
                </span>
                <h3 className="font-serif text-xl text-espresso-900 font-medium">
                  Order {activeSubmission.order?.orderNumber} — {activeSubmission.order?.customerName}
                </h3>
              </div>
              <button onClick={() => setActiveSubmission(null)} className="p-2 text-stone-muted hover:text-espresso-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split view (Image & Details) */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Receipt Preview */}
              <div className="bg-stone-light border border-stone p-2 min-h-[350px] flex items-center justify-center overflow-hidden">
                {activeSubmission.previewUrl ? (
                  activeSubmission.mimeType === 'application/pdf' ? (
                    <div className="text-center p-8 space-y-3">
                      <FileCheck2 className="w-12 h-12 text-espresso-900 mx-auto" />
                      <p className="text-xs font-mono">{activeSubmission.originalFilename}</p>
                      <a
                        href={activeSubmission.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-4 py-2 bg-espresso-900 text-ivory-100 text-xs uppercase tracking-editorial"
                      >
                        <span>Open PDF in Tab</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <img
                      src={activeSubmission.previewUrl}
                      alt="Bank receipt preview"
                      className="max-h-[500px] w-full object-contain"
                    />
                  )
                ) : (
                  <p className="text-xs text-charcoal">Preview not available</p>
                )}
              </div>

              {/* Order & Ledger Details */}
              <div className="space-y-6 text-xs">
                <div className="bg-ivory-50 border border-stone p-4 space-y-3">
                  <h4 className="font-serif text-base text-espresso-900 font-medium border-b border-stone/50 pb-1">
                    Order Ledger Check
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-charcoal/70">Expected Order Sum:</span>
                    <span className="font-serif font-bold text-base text-espresso-900">
                      {formatPrice(activeSubmission.order?.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/70">Submitted Sum:</span>
                    <span className="font-serif font-bold text-base text-emerald-800">
                      {formatPrice(activeSubmission.submittedAmount || activeSubmission.order?.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/70">Customer Phone:</span>
                    <span className="font-mono text-espresso-900">{activeSubmission.order?.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/70">Customer Email:</span>
                    <span className="font-mono text-espresso-900">{activeSubmission.order?.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/70">Uploaded File:</span>
                    <span className="font-mono text-[10px] text-stone-muted truncate max-w-[150px]">
                      {activeSubmission.originalFilename}
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => handleApprove(activeSubmission)}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs uppercase tracking-editorial font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Payment & Confirm Order</span>
                  </button>

                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isProcessing}
                    className="w-full py-3 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs uppercase tracking-editorial font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Receipt with Reason</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Prompt Modal */}
      {isRejectModalOpen && activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-espresso-900/90" onClick={() => setIsRejectModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-stone p-6 space-y-4 z-10 animate-in zoom-in-95">
            <h3 className="font-serif text-lg text-espresso-900 font-medium">
              Mandatory Rejection Reason
            </h3>
            <p className="text-xs text-charcoal font-light leading-relaxed">
              This message will be visible on the client's order tracking timeline to guide their re-submission.
            </p>

            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Bank narration reference TRX-123 could not be matched against current Zenith Bank statement."
              className="w-full bg-ivory-50 border border-stone p-3 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
            />

            <div className="flex space-x-2 justify-end pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 border border-stone text-xs uppercase tracking-editorial"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || rejectionReason.trim().length < 4}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs uppercase tracking-editorial font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
