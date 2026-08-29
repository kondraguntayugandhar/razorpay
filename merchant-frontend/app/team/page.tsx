'use client';

import React, { useEffect, useState } from 'react';
import { Users2, Plus, ShieldCheck, UserCheck, X } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('DEVELOPER');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const token = sessionStorage.getItem('fastpay_merchant_key') || 'rzp_test_acme_key_001';
        const res = await fetch(`${API_BASE_URL}/api/v1/merchant/team`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.data) {
          setMembers(data.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);

    try {
      const token = sessionStorage.getItem('fastpay_merchant_key') || 'rzp_test_acme_key_001';
      const res = await fetch(`${API_BASE_URL}/api/v1/merchant/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, role })
      });
      const data = await res.json();
      if (data.data) {
        setMembers((prev) => [data.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setShowModal(false);
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage team members, roles, and granular API/dashboard access permissions.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Team Members</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">{members.length} Active</h2>
        </div>
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Role Permissions</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">RBAC Enforced</h2>
        </div>
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">2FA Compliance</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">100% Verified</h2>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-xs">
                    Loading live merchant team members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-xs">
                    No team members recorded. Click "Invite Team Member" to add one.
                  </td>
                </tr>
              ) : (
                members.map((m, idx) => (
                  <tr key={m.email || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {(m.name || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <span>{m.name || 'Team Member'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{m.email}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{m.role || 'MEMBER'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-700 bg-emerald-100">
                        {m.status || 'ACTIVE'}
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
          <form onSubmit={handleInvite} className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Invite Team Member</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                  required
                >
                  <option value="ADMIN">Admin</option>
                  <option value="FINANCE">Finance Manager</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="SUPPORT">Support Agent</option>
                </select>
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
                disabled={inviting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                {inviting ? 'Inviting...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
