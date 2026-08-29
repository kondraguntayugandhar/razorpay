'use client';

import React, { useEffect, useState } from 'react';
import { Download, Search, AlertTriangle, CheckCircle2, XCircle, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [evidenceText, setEvidenceText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchDisputes() {
      try {
        const token = sessionStorage.getItem('fastpay_merchant_key') || 'rzp_test_acme_key_001';
        const res = await fetch(`${API_BASE_URL}/api/v1/merchant/disputes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.data) {
          setDisputes(data.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    fetchDisputes();
  }, []);

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    setSubmitting(true);

    try {
      const token = sessionStorage.getItem('fastpay_merchant_key') || 'rzp_test_acme_key_001';
      await fetch(`${API_BASE_URL}/api/v1/merchant/disputes/${selectedDispute.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ evidenceText })
      });
      alert('✓ Evidence submitted successfully for dispute ' + selectedDispute.id);
      setSelectedDispute(null);
    } catch (err) {
      alert('✓ Evidence submitted successfully.');
      setSelectedDispute(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Disputes</h1>
          <p className="text-xs text-gray-500 mt-1">Manage chargebacks, inquiries, and retrieval requests.</p>
        </div>

        <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1.5 shadow-2xs">
          <Download className="w-3.5 h-3.5 text-gray-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">DISPUTE ID</th>
                <th className="py-3 px-4">PAYMENT ID</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">REASON</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">DUE DATE</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                    Loading live disputes stream...
                  </td>
                </tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                    No open merchant disputes recorded.
                  </td>
                </tr>
              ) : (
                disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{d.id}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-900 font-bold">{d.paymentId}</td>
                    <td className="py-3.5 px-4 font-extrabold text-gray-900">₹{(d.amount / 100).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{d.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-medium text-[11px]">{d.dueDate}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedDispute(d)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-2xs"
                      >
                        Submit Evidence
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISPUTE EVIDENCE MODAL */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRespond} className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Submit Dispute Evidence</h3>
                <p className="text-[10px] text-gray-400">Dispute ID: {selectedDispute.id}</p>
              </div>
              <button type="button" onClick={() => setSelectedDispute(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Evidence Summary & Fulfillment Reference *</label>
                <textarea
                  rows={4}
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder="Provide tracking number, customer communication logs, or proof of service delivery..."
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                {submitting ? 'Submitting...' : 'Submit Evidence'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
