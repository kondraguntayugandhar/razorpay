'use client';

import React from 'react';
import { Mail, Phone, Building, Laptop, Smartphone, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your personal information and security settings.</p>
      </div>

      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: USER PROFILE CARD (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-6 shadow-2xs flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-md">
            AM
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">Arjun Mehta</h2>
            <p className="text-xs text-blue-600 font-semibold">Owner</p>
          </div>

          <div className="w-full pt-4 border-t border-gray-100 space-y-3 text-xs text-gray-600 text-left">
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">arjun.mehta@example.com</span>
            </div>

            <div className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span>+91 98765 43210</span>
            </div>

            <div className="flex items-center space-x-2.5">
              <Building className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">Mehta Enterprises Ltd.</span>
            </div>
          </div>

          <button className="w-full mt-2 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs">
            Edit Profile
          </button>
        </div>

        {/* RIGHT COLUMN: SECURITY & SESSIONS (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECURITY CARD */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-5">
            <h3 className="font-bold text-sm text-gray-900">Security</h3>

            <div className="space-y-4">
              {/* Password */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="font-bold text-xs text-gray-900">Password</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Last changed 45 days ago</p>
                </div>
                <button className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Change Password
                </button>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-xs text-gray-900">Two-Factor Authentication (2FA)</p>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                      ENABLED
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">Protect your account with an extra layer of security.</p>
                </div>
                <button className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Disable 2FA
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE SESSIONS CARD */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Active Sessions</h3>
              <button className="text-xs font-bold text-blue-600 hover:underline">
                Revoke All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Device</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Last Active</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  <tr className="hover:bg-gray-50/60">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2.5">
                        <Laptop className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-bold text-gray-900">MacBook Pro 16"</p>
                          <p className="text-[10px] text-gray-400">Chrome 114.0.0.0</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600">Mumbai, IN <span className="text-gray-400 text-[10px]">(192.168.1.1)</span></td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold text-[11px]">
                        <span>●</span>
                        <span>Active now</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Current Session</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50/60">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2.5">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-bold text-gray-900">iPhone 14 Pro</p>
                          <p className="text-[10px] text-gray-400">FastPay App v2.4</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600">Delhi, IN <span className="text-gray-400 text-[10px]">(10.0.0.3)</span></td>
                    <td className="py-3 px-3 text-gray-500">2 hours ago</td>
                    <td className="py-3 px-3 text-right">
                      <button className="text-gray-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
