'use client';

import React from 'react';
import { Users2, Plus, ShieldCheck, UserCheck } from 'lucide-react';

export default function TeamPage() {
  const members = [
    { name: 'Arjun M', email: 'arjun@fastpay.com', role: 'Owner', status: 'Active', statusColor: 'text-emerald-700 bg-emerald-100' },
    { name: 'Kavya Ramesh', email: 'kavya@fastpay.com', role: 'Finance Admin', status: 'Active', statusColor: 'text-emerald-700 bg-emerald-100' },
    { name: 'Siddharth V', email: 'siddharth@fastpay.com', role: 'Developer', status: 'Active', statusColor: 'text-emerald-700 bg-emerald-100' },
    { name: 'Neha Gupta', email: 'neha@fastpay.com', role: 'Support Agent', status: 'Pending Invite', statusColor: 'text-amber-700 bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage team members, roles, and granular API/dashboard access permissions</p>
        </div>

        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5">
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Team Members</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">4 Active</h2>
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
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {members.map((m) => (
                <tr key={m.email} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{m.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{m.email}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-600">{m.role}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${m.statusColor}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-xs text-blue-600 font-semibold hover:underline">Edit Role</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
