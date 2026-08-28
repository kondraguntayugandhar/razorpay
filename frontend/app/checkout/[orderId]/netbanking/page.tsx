'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '../../../../components/checkout/Header';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Building2, ArrowLeft, Search, CheckCircle2 } from 'lucide-react';

const POPULAR_BANKS = [
  { id: 'SBI', name: 'State Bank of India', code: 'SBIN' },
  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'ICICI', name: 'ICICI Bank', code: 'ICIC' },
  { id: 'AXIS', name: 'Axis Bank', code: 'UTIB' },
  { id: 'KOTAK', name: 'Kotak Mahindra Bank', code: 'KKBK' },
  { id: 'INDUS', name: 'IndusInd Bank', code: 'INDB' },
];

export default function NetBankingPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>('HDFC');

  const filteredBanks = POPULAR_BANKS.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSimulateNetBanking = () => {
    if (!selectedBank) return;
    router.push(`/checkout/${orderId}/processing?method=NETBANKING&bank=${selectedBank}`);
  };

  return (
    <div className="min-h-screen pb-12">
      <Header amountPaise={50000} orderId={orderId} />

      <main className="max-w-xl mx-auto px-4">
        <button
          onClick={() => router.push(`/checkout/${orderId}`)}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Change Payment Method</span>
        </button>

        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-100 text-base">Net Banking</h2>
                <p className="text-xs text-slate-400">Select your bank account</p>
              </div>
            </div>
            <Badge variant="slate">Sandbox Demo</Badge>
          </div>

          {/* Search Filter */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search bank name (e.g. SBI, HDFC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          </div>

          {/* Popular Bank Selection List */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {filteredBanks.map((bank) => {
              const isSelected = selectedBank === bank.id;
              return (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedBank(bank.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-slate-100 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-xs text-slate-100">{bank.id}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[120px]">{bank.name}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <Button
            variant="primary"
            onClick={handleSimulateNetBanking}
            disabled={!selectedBank}
          >
            <span>Proceed with {selectedBank || 'Bank'} Demo</span>
          </Button>
        </Card>
      </main>
    </div>
  );
}
