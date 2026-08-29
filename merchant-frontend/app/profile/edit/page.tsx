'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('Arjun');
  const [lastName, setLastName] = useState('Mehta');
  const [email, setEmail] = useState('arjun.mehta@example.com');
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [jobTitle, setJobTitle] = useState('Merchant Owner');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('✓ Profile updated successfully.');
    setTimeout(() => {
      setToastMessage(null);
      router.push('/profile');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      {/* HEADER */}
      <div className="flex items-center space-x-3">
        <button onClick={() => router.back()} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Profile</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your personal account information and credentials.</p>
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* FORM IN BOX CONTAINER */}
      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-2xs space-y-6">
        {/* AVATAR SECTION */}
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
            AM
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-gray-900">Profile Photo</h4>
            <div className="flex items-center space-x-2 text-xs">
              <button type="button" className="px-3 py-1 border border-gray-200 rounded-lg font-semibold text-gray-700 bg-white hover:bg-gray-50">
                Change avatar
              </button>
              <button type="button" className="px-3 py-1 text-gray-400 hover:text-red-600 font-semibold">
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* FIELDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold text-gray-700">Email Address *</label>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold text-gray-700">Mobile Number *</label>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </span>
            </div>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-gray-700 mb-1">Job Title / Role</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 text-xs">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
