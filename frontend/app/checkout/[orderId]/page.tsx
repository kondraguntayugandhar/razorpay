'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getOrder, createPayment, OrderResponse } from '../../../lib/api';

export default function MethodSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = (params?.orderId as string) || 'demo';

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Stateful accordion toggles requested by customer template
  const [upiOpen, setUpiOpen] = useState<boolean>(true);
  const [netbankingOpen, setNetbankingOpen] = useState<boolean>(false);
  const [walletOpen, setWalletOpen] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    if (!orderId) return;

    if (orderId === 'demo') {
      setOrder({
        id: 'demo-order-123',
        merchantId: '11111111-1111-1111-1111-111111111111',
        amount: 50000,
        currency: 'INR',
        status: 'CREATED',
        receipt: 'rcpt_demo_001',
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    getOrder(orderId)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Could not fetch order from backend:', err);
        setOrder({
          id: orderId,
          merchantId: '11111111-1111-1111-1111-111111111111',
          amount: 50000,
          currency: 'INR',
          status: 'CREATED',
          receipt: 'rcpt_001',
          createdAt: new Date().toISOString(),
        });
        setLoading(false);
      });
  }, [orderId]);

  const handleSelectUpi = async () => {
    setSubmitting(true);
    try {
      const targetOrderId = orderId === 'demo' ? '11111111-1111-1111-1111-111111111111' : orderId;
      const payment = await createPayment(targetOrderId, 'UPI');
      sessionStorage.setItem(`payment_${orderId}`, JSON.stringify(payment));
      router.push(`/checkout/${orderId}/upi?paymentId=${payment.id}`);
    } catch (err: any) {
      console.error('Failed to initiate UPI payment:', err);
      router.push(`/checkout/${orderId}/upi`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-slate-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 text-sm mt-3">Loading checkout session...</p>
        </div>
      </div>
    );
  }

  const amountPaise = order?.amount || 50000;
  const formattedAmount = (amountPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  });

  return (
    <div className="page-shell">
      {/* TOP NAVIGATION BAR */}
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()} aria-label="Go Back">
          ‹
        </button>
        <div className="portal-badge">⚡</div>
        <div className="portal-title">FastPay Checkout</div>
        <div className="profile-btn">
          <div className="person-head" />
          <div className="person-body" />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="content">
        <h1>Select Payment Method</h1>

        {/* OFFERS SECTION */}
        <h2>Available Offers</h2>
        <div className="offers">
          <div className="offer-row">
            <div className="offer-pill primary-offer">
              <div className="offer-icon pay">PAY</div>
              <span>pay Upto ₹50 cashback using A...</span>
            </div>
            <div className="offer-pill all-offers">
              <div className="mini-stack">
                <div className="mini-logo">🎁</div>
                <div className="plus">+</div>
              </div>
              <span>+4 View all</span>
            </div>
          </div>
        </div>

        {/* RECOMMENDED SECTION */}
        <h2>Recommended</h2>
        <div className="recommended">
          <div className="recommended-card">
            <button className="recommended-item" onClick={handleSelectUpi} disabled={submitting}>
              <div className="logo-wrap">
                <div className="gpay-logo">
                  <span>G</span>
                </div>
              </div>
              <div>
                <div>
                  <strong>UPI (Intent & Instant QR)</strong>
                </div>
                <div style={{ fontSize: '15px', color: '#278967', marginTop: '2px' }}>Pay with UPI</div>
              </div>
              <span className="chevron">›</span>
            </button>
          </div>
        </div>

        {/* ALL PAYMENT OPTIONS */}
        <h2>All Payment Options</h2>
        <div className="all-payment">
          {/* UPI SECTION (COLLAPSIBLE) */}
          <div className="payment-card">
            <button className="section-header" onClick={() => setUpiOpen(!upiOpen)}>
              <div className="category-icon">◈</div>
              <div className="section-main">
                <div className="section-title-line">
                  <strong>UPI Apps</strong>
                  <div className="tiny-logos">
                    <div className="tiny gpay" />
                    <div className="tiny phonepe">P</div>
                    <div className="tiny pop">pop</div>
                    <div className="tiny paytm">paytm</div>
                  </div>
                </div>
                <div className="offer-tag">5 Offers</div>
              </div>
              <span className="arrow">{upiOpen ? '⌃' : '⌄'}</span>
            </button>

            {upiOpen && (
              <div className="upi-grid">
                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo gpay">
                    <span>G</span>
                  </div>
                  <div className="upi-name">Google Pay</div>
                  <div className="upi-offer">Instant Transfer</div>
                </button>

                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo phonepe">P</div>
                  <div className="upi-name">PhonePe</div>
                  <div className="upi-offer">Cashback Eligible</div>
                </button>

                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo cred">C</div>
                  <div className="upi-name">CRED UPI</div>
                  <div className="upi-offer">Earn Coins</div>
                </button>

                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo" style={{ color: '#1684c7', background: '#eaf4fc', borderRadius: '10px' }}>
                    P
                  </div>
                  <div className="upi-name">Paytm</div>
                  <div className="upi-offer">Flat ₹25 Off</div>
                </button>

                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo bhim">B</div>
                  <div className="upi-name">BHIM</div>
                  <div className="upi-offer">Direct Bank</div>
                </button>

                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo" style={{ color: '#25D366', background: '#eefcf3', borderRadius: '50%' }}>
                    W
                  </div>
                  <div className="upi-name">WhatsApp Pay</div>
                  <div className="upi-offer">Fast & Simple</div>
                </button>

                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo" style={{ color: '#ff9900', background: '#fff7eb', borderRadius: '10px' }}>
                    A
                  </div>
                  <div className="upi-name">Amazon Pay</div>
                  <div className="upi-offer">Win Rewards</div>
                </button>

                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo" style={{ color: '#2563eb', background: '#eff6ff', borderRadius: '10px' }}>
                    N
                  </div>
                  <div className="upi-name">Navi UPI</div>
                  <div className="upi-offer">Low Latency</div>
                </button>

                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo" style={{ color: '#7c3aed', background: '#f5f3ff', borderRadius: '10px' }}>
                    J
                  </div>
                  <div className="upi-name">Jupiter UPI</div>
                  <div className="upi-offer">Smart Spends</div>
                </button>

                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo" style={{ color: '#059669', background: '#ecfdf5', borderRadius: '10px' }}>
                    B
                  </div>
                  <div className="upi-name">Bajaj Pay</div>
                  <div className="upi-offer">Instant Credit</div>
                </button>

                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo" style={{ color: '#dc2626', background: '#fef2f2', borderRadius: '10px' }}>
                    M
                  </div>
                  <div className="upi-name">Mobikwik UPI</div>
                  <div className="upi-offer">SuperCash</div>
                </button>

                <button className="upi-item" onClick={handleSelectUpi}>
                  <div className="app-logo more">
                    <span>+</span>
                  </div>
                  <div className="upi-name">POP & Other UPI</div>
                  <div className="upi-offer">Extra Popcoins</div>
                </button>
              </div>
            )}
          </div>

          {/* CARDS SECTION */}
          <div className="payment-card compact">
            <button className="section-header" onClick={() => router.push(`/checkout/${orderId}/card`)}>
              <div className="category-icon">▤</div>
              <div className="section-main">
                <div className="section-title-line">
                  <strong>Credit / Debit Card</strong>
                  <div className="card-brands">
                    <i>VISA</i>
                    <i>MC</i>
                    <i>RuPay</i>
                    <i>AMEX</i>
                  </div>
                </div>
                <div className="offer-tag long">Upto 1.5% savings with NeuCard on EMI/...</div>
              </div>
              <span className="arrow">›</span>
            </button>
          </div>

          {/* NETBANKING SECTION (COLLAPSIBLE) */}
          <div className="payment-card compact">
            <button className="section-header" onClick={() => setNetbankingOpen(!netbankingOpen)}>
              <div className="category-icon">♜</div>
              <div className="section-main">
                <div className="section-title-line">
                  <strong>Netbanking</strong>
                  <div className="bank-dots">
                    <i>SBI</i>
                    <i>ICICI</i>
                    <i>HDFC</i>
                    <i>Axis</i>
                  </div>
                </div>
              </div>
              <span className="arrow">{netbankingOpen ? '⌃' : '⌄'}</span>
            </button>

            {netbankingOpen && (
              <div className="dummy-options">
                <button onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>State Bank of India (SBI)</button>
                <button onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>HDFC Bank</button>
                <button onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>ICICI Bank</button>
                <button onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>Axis Bank</button>
                <button onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>Kotak Mahindra Bank</button>
                <button onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>Bank of Baroda</button>
              </div>
            )}
          </div>

          {/* WALLET SECTION (COLLAPSIBLE) */}
          <div className="payment-card compact">
            <button className="section-header" onClick={() => setWalletOpen(!walletOpen)}>
              <div className="category-icon">▣</div>
              <div className="section-main">
                <div className="section-title-line">
                  <strong>Wallet</strong>
                  <div className="card-brands">
                    <i>W</i>
                    <i>R</i>
                    <i>M</i>
                    <i>O</i>
                  </div>
                </div>
              </div>
              <span className="arrow">{walletOpen ? '⌃' : '⌄'}</span>
            </button>

            {walletOpen && (
              <div className="dummy-options">
                <button onClick={handleSelectUpi}>Mobikwik Wallet</button>
                <button onClick={handleSelectUpi}>Freecharge</button>
                <button onClick={handleSelectUpi}>Amazon Pay Wallet</button>
                <button onClick={handleSelectUpi}>Airtel Money</button>
              </div>
            )}
          </div>

          {/* BANK TRANSFER DIRECT OPTION */}
          <div className="payment-card compact">
            <button className="section-header" onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>
              <div className="category-icon">↗</div>
              <div className="section-main">
                <div className="section-title-line">
                  <strong>Bank transfer (NEFT/RTGS/IMPS)</strong>
                </div>
              </div>
              <span className="arrow">›</span>
            </button>
          </div>
        </div>

        {/* SECURED FOOTER */}
        <div className="secured">
          <span className="razor-mark">△</span>
          <span>Secured by</span>
          <b>Razorpay</b>
          <span>• Account & Terms</span>
        </div>
      </div>

      {/* FIXED BOTTOM CHECKOUT BAR */}
      <div className="checkout-bar">
        <div className="amount">
          <div>
            {formattedAmount} + Fee{' '}
            <span onClick={() => setShowDetails(!showDetails)} style={{ cursor: 'pointer' }}>
              View Details {showDetails ? '⌃' : '⌄'}
            </span>
          </div>
          <small>Order #{orderId.slice(0, 8)}</small>
        </div>
        <button className="continue-btn" onClick={handleSelectUpi} disabled={submitting}>
          {submitting ? 'Processing...' : `Continue to Pay ${formattedAmount}`}
        </button>
      </div>
    </div>
  );
}
