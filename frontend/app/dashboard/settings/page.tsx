'use client';

import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Settings, Building, Mail, AlertCircle, Save } from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = React.useState('Acme Store Inc.');
  const [email, setEmail] = React.useState('merchant@acme.com');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Merchant Profile Settings saved locally. Endpoint GET /api/v1/merchants/profile is noted as a backend gap.');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Merchant Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure business profile details and merchant preferences</p>
      </div>

      {/* Backend Gap Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2.5">
        <AlertCircle className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Backend Merchant Profile Note:</span> Backend profile CRUD endpoints are noted as a gap; settings below display local merchant profile stub state.
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">Business Profile</h2>
              <p className="text-xs text-slate-400">Merchant Account ID: 11111111-1111-1111-1111-111111111111</p>
            </div>
          </div>
          <Badge variant="emerald">ACTIVE MERCHANT</Badge>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Business Store Name</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-violet-500"
              />
              <Building className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Support Contact Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-violet-500"
              />
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full sm:w-auto px-6 py-2.5">
              <Save className="h-4 w-4 mr-1.5" />
              <span>Save Merchant Profile</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
