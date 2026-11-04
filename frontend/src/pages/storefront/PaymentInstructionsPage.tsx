import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { formatPrice } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Copy,
  Check,
  UploadCloud,
  FileText,
  Clock,
  Building2,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

export const PaymentInstructionsPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { success, error } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [submittedAmount, setSubmittedAmount] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!orderNumber) return;
      setIsLoading(true);
      try {
        const res = await api.getPaymentInstructions(orderNumber);
        if (res.success) {
          setBankDetails(res.data.bankDetails);
          if (res.data.order) {
            setOrder(res.data.order);
            setSubmittedAmount(String(res.data.order.totalAmount));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [orderNumber]);

  const handleCopyAccount = () => {
    if (bankDetails?.accountNumber) {
      navigator.clipboard.writeText(bankDetails.accountNumber);
      setCopied(true);
      success('Copied to Clipboard', `Account number ${bankDetails.accountNumber} copied.`);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowed.includes(selected.type)) {
        error('Invalid File', 'Only JPEG, PNG, WebP images and PDF documents are accepted.');
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        error('File Too Large', 'Maximum receipt file size is 10MB.');
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !orderNumber) {
      error('File Required', 'Please select a receipt document or screenshot.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      formData.append('orderNumber', orderNumber);
      if (token) formData.append('guestAccessToken', token);
      if (submittedAmount) formData.append('submittedAmount', submittedAmount);
      if (paymentReference) formData.append('paymentReference', paymentReference);

      const res = await api.submitReceipt(formData);
      if (res.success) {
        setUploadSuccess(true);
        success('Receipt Uploaded', 'Your proof of payment was received and is under concierge verification.');
      }
    } catch (err: any) {
      error('Upload Failed', err.message || 'Could not submit payment receipt.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="text-xs uppercase tracking-editorial text-charcoal">Loading transfer instructions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Top Order Created Banner */}
      <div className="bg-white border border-stone p-8 sm:p-10 text-center space-y-3">
        <span className="text-[10px] uppercase tracking-widest text-champagne-dark font-mono font-semibold">
          Order Reference Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-espresso-900 font-medium tracking-wide">
          Payment Instructions for {orderNumber}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal font-light max-w-lg mx-auto leading-relaxed">
          Your order has been recorded. To secure allocation, kindly transfer the exact amount due to our corporate bank account below.
        </p>
        {order?.totalAmount && (
          <div className="pt-2">
            <span className="text-xs uppercase tracking-editorial text-charcoal block">Total Amount Due</span>
            <span className="font-serif text-3xl sm:text-4xl font-bold text-espresso-900">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Corporate Bank Wire Details Box */}
      <div className="bg-ivory-50 border border-stone p-8 space-y-6">
        <div className="flex items-center space-x-3 border-b border-stone/50 pb-4">
          <Building2 className="w-5 h-5 text-espresso-900" />
          <h2 className="font-serif text-xl text-espresso-900 font-medium">
            Beneficiary Bank Account
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-charcoal/70 block mb-1">
              Bank Name
            </span>
            <span className="font-serif text-base text-espresso-900 font-medium">
              {bankDetails?.bankName || 'Zenith Bank PLC'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-widest text-charcoal/70 block mb-1">
              Beneficiary Account Name
            </span>
            <span className="font-serif text-base text-espresso-900 font-medium">
              {bankDetails?.accountName || 'MagnifiScent Luxury Retail Ltd'}
            </span>
          </div>

          <div className="sm:col-span-2 bg-white border border-stone p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-charcoal/70 block mb-0.5">
                NUBAN Account Number
              </span>
              <span className="font-mono text-2xl font-bold text-espresso-900 tracking-wider">
                {bankDetails?.accountNumber || '1012345678'}
              </span>
            </div>

            <button
              onClick={handleCopyAccount}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-espresso-900 hover:bg-espresso-800 text-ivory-100 text-xs uppercase tracking-editorial font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Number'}</span>
            </button>
          </div>
        </div>

        {/* Instructions Note */}
        <div className="bg-white/80 border border-stone/80 p-4 space-y-2 text-xs text-charcoal">
          <div className="flex items-center space-x-2 text-espresso-900 font-medium">
            <Clock className="w-4 h-4 text-champagne-dark" />
            <span>Important Transfer Instructions</span>
          </div>
          <p className="leading-relaxed">
            Please use <strong>{orderNumber}</strong> as the payment narration or reference on your banking app. Transfers are verified by our finance team against our actual bank statements.
          </p>
        </div>
      </div>

      {/* Proof of Payment Upload Box */}
      <div className="bg-white border border-stone p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone/50 pb-4">
          <div className="flex items-center space-x-3">
            <UploadCloud className="w-5 h-5 text-espresso-900" />
            <h2 className="font-serif text-xl text-espresso-900 font-medium">
              Upload Payment Receipt
            </h2>
          </div>
          {uploadSuccess && (
            <span className="inline-flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Received</span>
            </span>
          )}
        </div>

        {uploadSuccess ? (
          <div className="text-center py-10 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
            <h3 className="font-serif text-2xl text-espresso-900 font-medium">
              Receipt Under Verification
            </h3>
            <p className="text-xs sm:text-sm text-charcoal max-w-md mx-auto leading-relaxed font-light">
              We have received your payment receipt for <strong>{orderNumber}</strong>. Our concierge desk is reconciling the transfer with our banking records and will confirm your order shortly.
            </p>
            <div className="pt-4 flex justify-center space-x-4">
              <Link
                to={`/track?orderNumber=${orderNumber}${token ? `&token=${token}` : ''}`}
                className="px-6 py-3 bg-espresso-900 text-ivory-100 text-xs uppercase tracking-editorial font-medium hover:bg-champagne-dark transition-colors inline-flex items-center space-x-2"
              >
                <span>Track Order Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitReceipt} className="space-y-6">
            <p className="text-xs text-charcoal leading-relaxed font-light">
              Once you complete the transfer, upload your bank transaction receipt (JPEG, PNG, WebP, or PDF, max 10MB).
            </p>

            {/* File Dropzone */}
            <div className="border-2 border-dashed border-stone hover:border-espresso-900 transition-colors p-8 text-center bg-ivory-50/50 relative cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2 pointer-events-none">
                <FileText className="w-8 h-8 text-stone-muted mx-auto stroke-[1.5]" />
                <p className="text-xs font-medium text-espresso-900">
                  {file ? file.name : 'Click to select or drag & drop payment receipt'}
                </p>
                <p className="text-[10px] text-charcoal/70 uppercase tracking-widest font-mono">
                  JPEG, PNG, WebP or PDF (Max 10MB)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Amount Transferred (₦)
                </label>
                <input
                  type="number"
                  value={submittedAmount}
                  onChange={(e) => setSubmittedAmount(e.target.value)}
                  placeholder="e.g. 1850000"
                  className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Bank Reference / Narration (Optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. TRX-992144 or Sender Name"
                  className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading || !file}
              className="w-full py-4 bg-espresso-900 hover:bg-espresso-800 disabled:opacity-50 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>{isUploading ? 'Submitting Receipt...' : 'Submit Payment Proof'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Concierge Assistance link */}
      <div className="text-center pt-4">
        <a
          href={`https://wa.me/2348000000000?text=${encodeURIComponent(`Hello Concierge, I have a question regarding payment for Order ${orderNumber}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-editorial text-charcoal hover:text-espresso-900"
        >
          <MessageSquare className="w-4 h-4 text-emerald-700" />
          <span>Require assistance? Contact WhatsApp Concierge</span>
        </a>
      </div>
    </div>
  );
};
