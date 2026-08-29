'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Download, Link2, X } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('450');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const token = sessionStorage.getItem('fastpay_merchant_key') || 'rzp_test_acme_key_001';
        const res = await fetch(`${API_BASE_URL}/api/v1/merchant/links`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.data) {
          setLinks(data.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = sessionStorage.getItem('fastpay_merchant_key') || 'rzp_test_acme_key_001';
      const res = await fetch(`${API_BASE_URL}/api/v1/merchant/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseInt(amount, 10) * 100,
          description: description || 'Payment Link'
        })
      });
      const data = await res.json();
      if (data.data) {
        setLinks((prev) => [data.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setShowModal(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Links</h1>
          <p className="text-xs text-gray-500 mt-1">Create shareable links to accept payments instantly across WhatsApp, email, or SMS.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Payment Link</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">SHORT CODE / LINK</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-xs">
                    Loading live payment links...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-xs">
                    No payment links created yet. Click "Create Payment Link" to issue one.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{link.shortCode || link.id}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{link.description || 'FastPay Link'}</td>
                    <td className="py-3.5 px-4 font-extrabold text-gray-900">₹{(link.amount / 100).toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        {link.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Create Payment Link</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Title *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Diwali Corporate Gift Hampers"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                {creating ? 'Creating...' : 'Create Link'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
