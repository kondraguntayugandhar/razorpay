'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getOrder, createPayment, PaymentResponse, OrderResponse } from '../../../lib/api';
import { PaymentSseClient } from '../../../lib/sse';
import { ArrowLeft, ChevronRight, ChevronDown, ChevronUp, Smartphone, QrCode, RefreshCw, X, Copy, Check, Tag, Percent } from 'lucide-react';

interface OfferItem {
  id: string;
  provider: string;
  badge: string;
  badgeBg: string;
  title: string;
  code: string;
  terms: string;
}

const AVAILABLE_OFFERS: OfferItem[] = [
  {
    id: '1',
    provider: 'Amazon Pay',
    badge: 'pay',
    badgeBg: 'bg-[#58759d] text-white',
    title: 'Upto ₹50 cashback using Amazon Pay',
    code: 'AMAZON50',
    terms: 'Valid on min spend ₹100. Instant wallet credit.',
  },
  {
    id: '2',
    provider: 'PayTM',
    badge: 'paytm',
    badgeBg: 'bg-[#002e6e] text-white font-bold',
    title: 'Upto ₹200 cashback on Paytm UPI & Wallet',
    code: 'PAYTM200',
    terms: 'Applicable once per user transaction.',
  },
  {
    id: '3',
    provider: 'PhonePe',
    badge: 'पे',
    badgeBg: 'bg-purple-600 text-white font-bold',
    title: 'Flat ₹30 cashback on PhonePe UPI',
    code: 'PHONEPE30',
    terms: 'Instant bank account credit within 24h.',
  },
  {
    id: '4',
    provider: 'CRED UPI',
    badge: 'C',
    badgeBg: 'bg-black text-white font-bold',
    title: 'Earn 500 CRED Coins on transaction',
    code: 'CRED500',
    terms: 'Exclusive for registered CRED app members.',
  },
  {
    id: '5',
    provider: 'BHIM UPI',
    badge: 'BHIM',
    badgeBg: 'bg-orange-600 text-white font-bold',
    title: 'Upto ₹50 cashback on BHIM UPI',
    code: 'BHIM50',
    terms: 'Direct NPCI Government scheme cashback.',
  },
];

export default function MethodSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = (params?.orderId as string) || 'demo';

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [upiOpen, setUpiOpen] = useState<boolean>(true);
  const [netbankingOpen, setNetbankingOpen] = useState<boolean>(false);
  const [walletOpen, setWalletOpen] = useState<boolean>(false);
  const [showQrFirstPage, setShowQrFirstPage] = useState<boolean>(true);
  const [copiedQr, setCopiedQr] = useState<boolean>(false);

  // Offers Modal State
  const [isOffersModalOpen, setIsOffersModalOpen] = useState<boolean>(false);
  const [appliedOffer, setAppliedOffer] = useState<OfferItem | null>(null);

  // Session UPI QR Data
  const [upiQrData, setUpiQrData] = useState<string>('upi://pay?pa=merchant@upi&pn=My%20Store&am=100&cu=INR');

  // Inline UPI App Direct Launch Modal State
  const [activePayment, setActivePayment] = useState<PaymentResponse | null>(null);
  const [selectedAppName, setSelectedAppName] = useState<string>('PhonePe');
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);
  const [sseStatusText, setSseStatusText] = useState<string>('Waiting for payment authorization...');

  useEffect(() => {
    if (!orderId) return;

    const initPageSession = (amt: number) => {
      const amountRupees = (amt / 100).toFixed(0);
      const generatedUpiData = `upi://pay?pa=merchant@upi&pn=My%20Store&am=${amountRupees}&cu=INR`;
      setUpiQrData(generatedUpiData);

      // Save UPI QR Session in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('upiQrData', generatedUpiData);
        sessionStorage.setItem(
          `upi_session_${orderId}`,
          JSON.stringify({
            upiQrData: generatedUpiData,
            orderId,
            amount: amt,
            timestamp: Date.now(),
          })
        );
      }
    };

    if (orderId === 'demo') {
      const demoAmt = 10000;
      setOrder({
        id: 'demo-order-123',
        merchantId: '11111111-1111-1111-1111-111111111111',
        amount: demoAmt, // ₹100
        currency: 'INR',
        status: 'CREATED',
        receipt: 'rcpt_demo_001',
        createdAt: new Date().toISOString(),
      });
      initPageSession(demoAmt);
      setLoading(false);
      return;
    }

    getOrder(orderId)
      .then((data) => {
        setOrder(data);
        initPageSession(data.amount || 10000);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Could not fetch order from backend:', err);
        const fallbackAmt = 10000;
        setOrder({
          id: orderId,
          merchantId: '11111111-1111-1111-1111-111111111111',
          amount: fallbackAmt,
          currency: 'INR',
          status: 'CREATED',
          receipt: 'rcpt_001',
          createdAt: new Date().toISOString(),
        });
        initPageSession(fallbackAmt);
        setLoading(false);
      });
  }, [orderId]);

  // Subscribe to SSE updates when inline UPI modal is open
  useEffect(() => {
    if (!isUpiModalOpen || !activePayment) return;

    let sseClient: PaymentSseClient | null = null;

    sseClient = new PaymentSseClient({
      paymentId: activePayment.id,
      timeoutMs: 20000,
      onUpdate: (updated) => {
        setActivePayment(updated);
        if (updated.status === 'SUCCESS') {
          router.push(`/checkout/${orderId}/success?paymentId=${updated.id}`);
        } else if (updated.status === 'FAILED') {
          router.push(`/checkout/${orderId}/failed?paymentId=${updated.id}&code=${updated.errorCode || ''}&desc=${encodeURIComponent(updated.errorDescription || '')}`);
        }
      },
      onTimeoutOrError: () => {
        router.push(`/checkout/${orderId}/uncertain?paymentId=${activePayment.id}`);
      },
    });

    sseClient.connect();

    return () => {
      if (sseClient) {
        sseClient.close();
      }
    };
  }, [isUpiModalOpen, activePayment, orderId, router]);

  // Direct Launch UPI App (PhonePe, Google Pay, Paytm, etc.) without page navigation
  const handleLaunchUpiApp = async (appName: string, customScheme?: string) => {
    setSubmitting(true);
    try {
      const targetOrderId = orderId === 'demo' ? '11111111-1111-1111-1111-111111111111' : orderId;
      const payment = await createPayment(targetOrderId, 'UPI');
      
      setActivePayment(payment);
      setSelectedAppName(appName);
      setIsUpiModalOpen(true);
      setSseStatusText(`Opening ${appName}... Complete payment inside the app.`);

      const baseIntent = payment.intentUri || upiQrData;
      const targetUri = customScheme ? baseIntent.replace(/^upi:\/\//, customScheme) : baseIntent;

      window.location.href = targetUri;
    } catch (err: any) {
      console.warn('Backend payment creation fallback:', err);
      const mockPay: PaymentResponse = {
        id: `pay_upi_${Date.now()}`,
        orderId,
        merchantId: '11111111-1111-1111-1111-111111111111',
        amount: order?.amount || 10000,
        currency: 'INR',
        status: 'PENDING',
        method: 'UPI',
        intentUri: upiQrData,
        qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      };
      setActivePayment(mockPay);
      setSelectedAppName(appName);
      setIsUpiModalOpen(true);
      setSseStatusText(`Opening ${appName}... Complete payment inside the app.`);

      const mockUri = customScheme ? upiQrData.replace(/^upi:\/\//, customScheme) : upiQrData;
      window.location.href = mockUri;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyQrString = () => {
    navigator.clipboard.writeText(upiQrData);
    setCopiedQr(true);
    setTimeout(() => setCopiedQr(false), 2000);
  };

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-3 border-[#58759d] border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 text-xs mt-3">Loading payment options...</p>
        </div>
      </div>
    );
  }

  const amountPaise = order?.amount || 10000;
  const formattedAmount = (amountPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiQrData)}`;
  const currentOffer = appliedOffer || AVAILABLE_OFFERS[0];

  return (
    <div className="page-shell">
      {/* TOPBAR */}
      <header className="topbar">
        <button className="back-btn" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="portal-badge">F</div>
        <div className="portal-title">FastPay</div>
      </header>

      <main className="content">
        <h1 className="page-title">Payment Options</h1>

        {/* 1ST PAGE UPI QR CODE CARD */}
        <div className="mb-5 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-gray-900">Scan UPI QR Code</span>
            </div>
            <button
              onClick={() => setShowQrFirstPage(!showQrFirstPage)}
              className="text-xs text-emerald-700 font-semibold underline"
            >
              {showQrFirstPage ? 'Hide QR' : 'Show QR'}
            </button>
          </div>

          {showQrFirstPage && (
            <div className="mt-3 flex flex-col items-center text-center">
              <div className="p-2.5 bg-white border-2 border-emerald-600 rounded-xl shadow-md">
                <img
                  src={qrImageUrl}
                  alt="UPI QR Code"
                  className="w-40 h-40 object-contain"
                />
              </div>
              <p className="text-[11px] text-gray-600 mt-2 font-medium">Scan using any UPI app to pay {formattedAmount}</p>

              {/* Session UPI String Display */}
              <div className="mt-2.5 w-full max-w-sm p-2 bg-white rounded-lg border border-emerald-200 text-left flex items-center justify-between text-[11px] font-mono text-gray-700">
                <span className="truncate mr-2">{upiQrData}</span>
                <button onClick={handleCopyQrString} className="text-emerald-600 hover:text-emerald-800 shrink-0">
                  {copiedQr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AVAILABLE OFFERS */}
        <div className="section-label">Available Offers</div>
        <div className="offers-row">
          <div className="offer-pill-primary flex items-center space-x-2">
            <div className={`mini-app-badge px-1.5 py-0.5 rounded text-[10px] ${currentOffer.badgeBg}`}>
              {currentOffer.badge}
            </div>
            <span className="truncate">{currentOffer.title}</span>
          </div>
          <button className="offer-pill-secondary hover:bg-gray-100 transition-colors" onClick={() => setIsOffersModalOpen(true)}>
            <span className="text-xs text-gray-600 font-bold">+{AVAILABLE_OFFERS.length - 1}</span>
            <span>View all</span>
          </button>
        </div>

        {/* RECOMMENDED */}
        <div className="section-label">Recommended</div>
        <div className="recommended-card-group">
          <button className="recommended-row" onClick={() => handleLaunchUpiApp('Google Pay', 'gpay://')} disabled={submitting}>
            <div className="app-icon-small gpay">G</div>
            <span>UPI - Google Pay</span>
            <ChevronRight className="item-chevron" />
          </button>

          <button className="recommended-row" onClick={() => handleLaunchUpiApp('PhonePe', 'phonepe://')} disabled={submitting}>
            <div className="app-icon-small phonepe">पे</div>
            <span className="font-bold text-purple-950">UPI - PhonePe</span>
            <ChevronRight className="item-chevron" />
          </button>

          <button className="recommended-row" onClick={() => handleLaunchUpiApp('CRED UPI')} disabled={submitting}>
            <div className="app-icon-small cred">C</div>
            <span>UPI - CRED UPI</span>
            <ChevronRight className="item-chevron" />
          </button>
        </div>

        {/* ALL PAYMENT OPTIONS */}
        <div className="section-label">All Payment Options</div>
        <div className="payment-options-group">
          {/* UPI SECTION */}
          <div className="border-b border-gray-100">
            <button className="option-accordion-header" onClick={() => setUpiOpen(!upiOpen)}>
              <div className="option-icon-wrap">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>

              <div className="option-header-content">
                <div className="option-title-row">
                  <span className="option-title-text">UPI</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">GPay</span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">PhonePe</span>
                    <span className="text-[10px] bg-cyan-100 text-cyan-700 px-1 rounded">Paytm</span>
                  </div>
                </div>
                <div className="offer-badge-emerald">5 Offers Available</div>
              </div>

              <span className="accordion-arrow">{upiOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
            </button>

            {upiOpen && (
              <div className="upi-app-grid">
                <button className="upi-app-button" onClick={() => handleLaunchUpiApp('Google Pay', 'gpay://')}>
                  <div className="app-icon-small gpay">G</div>
                  <div className="app-info">
                    <span className="app-name">Google Pay</span>
                  </div>
                </button>

                <button className="upi-app-button" onClick={() => handleLaunchUpiApp('PayTM', 'paytmmp://')}>
                  <div className="app-icon-small paytm">paytm</div>
                  <div className="app-info">
                    <span className="app-name">PayTM</span>
                    <span className="app-offer-text">Upto ₹200 cash...</span>
                  </div>
                </button>

                <button className="upi-app-button border-purple-300 bg-purple-50/50" onClick={() => handleLaunchUpiApp('PhonePe', 'phonepe://')}>
                  <div className="app-icon-small phonepe">पे</div>
                  <div className="app-info">
                    <span className="app-name font-bold text-purple-900">PhonePe</span>
                    <span className="app-offer-text">Launch App Direct</span>
                  </div>
                </button>

                <button className="upi-app-button" onClick={() => handleLaunchUpiApp('CRED UPI')}>
                  <div className="app-icon-small cred">C</div>
                  <div className="app-info">
                    <span className="app-name">CRED UPI</span>
                  </div>
                </button>

                <button className="upi-app-button" onClick={() => handleLaunchUpiApp('BHIM')}>
                  <div className="app-icon-small bhim">BHIM</div>
                  <div className="app-info">
                    <span className="app-name">BHIM</span>
                    <span className="app-offer-text">Upto ₹50 cashb...</span>
                  </div>
                </button>

                <button className="upi-app-button" onClick={() => handleLaunchUpiApp('UPI')}>
                  <div className="app-icon-small text-gray-500 bg-gray-100">•••</div>
                  <div className="app-info">
                    <span className="app-name">Apps & UPI ID</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* CARDS SECTION */}
          <div className="border-b border-gray-100">
            <button className="option-accordion-header" onClick={() => router.push(`/checkout/${orderId}/card`)}>
              <div className="option-icon-wrap">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>

              <div className="option-header-content">
                <div className="option-title-row">
                  <span className="option-title-text">Cards</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[9px] text-gray-500 font-mono">VISA</span>
                    <span className="text-[9px] text-gray-500 font-mono">MC</span>
                    <span className="text-[9px] text-gray-500 font-mono">RuPay</span>
                  </div>
                </div>
                <div className="offer-badge-subtle">Upto 1.5% savings with NeuCard on EMI/...</div>
              </div>

              <ChevronRight className="item-chevron" />
            </button>
          </div>

          {/* NETBANKING SECTION */}
          <div className="border-b border-gray-100">
            <button className="option-accordion-header" onClick={() => setNetbankingOpen(!netbankingOpen)}>
              <div className="option-icon-wrap">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3L2 10h20L12 3z" />
                </svg>
              </div>

              <div className="option-header-content">
                <div className="option-title-row">
                  <span className="option-title-text">Netbanking</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[9px] text-blue-600 font-bold">SBI</span>
                    <span className="text-[9px] text-red-600 font-bold">HDFC</span>
                    <span className="text-[9px] text-orange-600 font-bold">ICICI</span>
                  </div>
                </div>
              </div>

              <span className="accordion-arrow">{netbankingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
            </button>

            {netbankingOpen && (
              <div className="p-3 bg-gray-50 grid grid-cols-2 gap-2 text-xs">
                <button className="p-2 border bg-white rounded text-left font-medium text-gray-800" onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>State Bank of India</button>
                <button className="p-2 border bg-white rounded text-left font-medium text-gray-800" onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>HDFC Bank</button>
                <button className="p-2 border bg-white rounded text-left font-medium text-gray-800" onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>ICICI Bank</button>
                <button className="p-2 border bg-white rounded text-left font-medium text-gray-800" onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>Axis Bank</button>
              </div>
            )}
          </div>

          {/* WALLET SECTION */}
          <div className="border-b border-gray-100">
            <button className="option-accordion-header" onClick={() => setWalletOpen(!walletOpen)}>
              <div className="option-icon-wrap">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12a2 2 0 002 2h14v-4" />
                  <path d="M18 12a2 2 0 00-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                </svg>
              </div>

              <div className="option-header-content">
                <div className="option-title-row">
                  <span className="option-title-text">Wallet</span>
                </div>
              </div>

              <span className="accordion-arrow">{walletOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
            </button>

            {walletOpen && (
              <div className="p-3 bg-gray-50 grid grid-cols-2 gap-2 text-xs">
                <button className="p-2 border bg-white rounded text-left font-medium text-gray-800" onClick={() => handleLaunchUpiApp('Mobikwik Wallet')}>Mobikwik Wallet</button>
                <button className="p-2 border bg-white rounded text-left font-medium text-gray-800" onClick={() => handleLaunchUpiApp('Freecharge')}>Freecharge</button>
                <button className="p-2 border bg-white rounded text-left font-medium text-gray-800" onClick={() => handleLaunchUpiApp('Amazon Pay Wallet')}>Amazon Pay Wallet</button>
              </div>
            )}
          </div>

          {/* BANK TRANSFER */}
          <div>
            <button className="option-accordion-header" onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>
              <div className="option-icon-wrap">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>

              <div className="option-header-content">
                <div className="option-title-row">
                  <span className="option-title-text">Bank transfer</span>
                </div>
              </div>

              <ChevronRight className="item-chevron" />
            </button>
          </div>
        </div>

        {/* SECURED FOOTER */}
        <div className="secured-footer">
          <span>Secured by</span>
          <b className="text-blue-600 font-bold italic">Razorpay</b>
          <span>• Account & Terms</span>
        </div>
      </main>

      {/* STICKY BOTTOM CHECKOUT BAR */}
      <footer className="checkout-bar">
        <div className="amount-info">
          <div>
            <span className="amount-main">{formattedAmount}</span>
            <span className="amount-fee">+ Fee</span>
          </div>
          <div className="view-details-link">
            <span>View Details</span>
            <ChevronUp className="w-3 h-3 text-gray-500" />
          </div>
        </div>

        <button className="continue-btn" onClick={() => handleLaunchUpiApp('PhonePe', 'phonepe://')} disabled={submitting}>
          {submitting ? 'Opening PhonePe...' : 'Continue'}
        </button>
      </footer>

      {/* ALL OFFERS & DISCOUNTS MODAL */}
      {isOffersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 relative shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-4 shrink-0">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-base">Available Offers ({AVAILABLE_OFFERS.length})</h3>
              </div>
              <button
                onClick={() => setIsOffersModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {AVAILABLE_OFFERS.map((offer) => {
                const isSelected = appliedOffer?.id === offer.id;
                return (
                  <div
                    key={offer.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                        : 'border-gray-200 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg ${offer.badgeBg} flex items-center justify-center text-xs shrink-0 shadow-xs mt-0.5`}>
                          {offer.badge}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-gray-900">{offer.title}</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">{offer.terms}</p>
                          <div className="mt-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-gray-100 text-[10px] font-mono text-gray-700 border border-gray-200">
                            <Percent className="w-3 h-3 text-emerald-600" />
                            <span>CODE: {offer.code}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setAppliedOffer(offer);
                          setIsOffersModalOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {isSelected ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t mt-3 shrink-0">
              <button
                onClick={() => setIsOffersModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INLINE DIRECT UPI APP LAUNCH MODAL */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 relative shadow-2xl animate-in slide-in-from-bottom duration-200">
            <button
              onClick={() => setIsUpiModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                {selectedAppName === 'PhonePe' ? 'पे' : selectedAppName.slice(0, 1)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Opening {selectedAppName}</h3>
                <p className="text-xs text-gray-500">App launch initiated automatically</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 mb-4 text-xs text-purple-900 flex items-start space-x-2.5">
              <Smartphone className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Complete payment in {selectedAppName}</p>
                <p className="text-purple-700 mt-0.5">If the app did not open automatically, tap the button below to retry launching {selectedAppName}.</p>
              </div>
            </div>

            {/* Desktop QR Display */}
            <div className="my-4 flex flex-col items-center border-t border-b border-gray-100 py-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">Scan QR Code using any UPI App</p>
              <div className="p-2.5 bg-white border-2 border-emerald-600 rounded-xl">
                <img
                  src={qrImageUrl}
                  alt="UPI QR Code"
                  className="w-36 h-36 object-contain"
                />
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 font-medium my-3">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{sseStatusText}</span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  const baseUri = upiQrData;
                  const uri = selectedAppName === 'PhonePe' ? baseUri.replace(/^upi:\/\//, 'phonepe://') : baseUri;
                  window.location.href = uri;
                }}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md transition-colors"
              >
                Launch {selectedAppName} Again
              </button>

              <button
                onClick={() => setIsUpiModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium text-xs hover:bg-gray-50 transition-colors"
              >
                Cancel & Choose Different Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
