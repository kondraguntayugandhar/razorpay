'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getNetbankingBanks, createPayment } from '../../../../lib/api';
import { ArrowLeft, Search, ChevronRight, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FastPayLogo } from '../../../../components/ui/FastPayLogo';


interface Bank {
  code: string;
  name: string;
  isPopular?: boolean;
}

const POPULAR_BANK_CODES = ['SBIN', 'HDFC', 'ICIC', 'UTIB', 'KKBK', 'BARB_R', 'CNRB'];

export default function NetbankingPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = (params?.orderId as string) || 'demo';

  const [banks, setBanks] = useState<Bank[]>([]);
  const [popularBanks, setPopularBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  useEffect(() => {
    getNetbankingBanks()
      .then((data) => {
        const bankList: Bank[] = Object.entries(data)
          .map(([code, name]) => ({
            code,
            name,
            isPopular: POPULAR_BANK_CODES.includes(code),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setBanks(bankList);
        setPopularBanks(bankList.filter((b) => b.isPopular));
        setFilteredBanks(bankList);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load Netbanking banks:', err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (query: string) => {
    setSearchText(query);
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setFilteredBanks(banks);
      return;
    }
    const result = banks.filter(
      (b) =>
        b.name.toLowerCase().includes(trimmed) ||
        b.code.toLowerCase().includes(trimmed)
    );
    setFilteredBanks(result);
  };

  const handleSelectBank = async (bank: Bank) => {
    setSelectedBank(bank);
    setSubmitting(true);
    try {
      const targetOrderId = orderId === 'demo' ? '11111111-1111-1111-1111-111111111111' : orderId;
      await createPayment(targetOrderId, 'NETBANKING', { bank: bank.code });
      router.push(`/checkout/${orderId}/processing?method=NETBANKING&bank=${bank.code}`);
    } catch (err: any) {
      console.warn('Netbanking payment creation fallback:', err);
      router.push(`/checkout/${orderId}/processing?method=NETBANKING&bank=${bank.code}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* TOPBAR */}
      <header className="py-4 px-5 border-b border-gray-100 flex items-center justify-between bg-white shadow-2xs">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 p-1" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Netbanking</h1>
        </div>
        <FastPayLogo size="sm" />
      </header>

      <main className="max-w-xl mx-auto w-full px-5 py-6 flex-1 flex flex-col">
        {/* SEARCH CONTAINER */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search your bank"
            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs"
          />
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-16 text-center">
            <div className="animate-spin h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 text-xs mt-3">Fetching Razorpay supported banks...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-6 flex-1">
            {/* POPULAR BANKS SECTION (If not searching) */}
            {!searchText && (
              <section>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
                  Popular Banks
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {popularBanks.map((bank) => (
                    <button
                      key={bank.code}
                      onClick={() => handleSelectBank(bank)}
                      disabled={submitting}
                      className="p-3.5 bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-xl text-left flex items-center justify-between transition-all group shadow-2xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                          {bank.code.slice(0, 3)}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-gray-900 block truncate max-w-[150px]">
                            {bank.name}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">{bank.code}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ALL BANKS SECTION */}
            <section>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                {searchText ? `Search Results (${filteredBanks.length})` : `All Banks (${banks.length})`}
              </h2>

              {filteredBanks.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No bank found matching "<b className="text-gray-900">{searchText}</b>"
                </div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
                  {filteredBanks.map((bank) => (
                    <button
                      key={bank.code}
                      onClick={() => handleSelectBank(bank)}
                      disabled={submitting}
                      className="w-full px-4 py-3.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                          🏦
                        </div>
                        <div>
                          <span className="font-medium text-sm text-gray-900 block">{bank.name}</span>
                          <span className="text-[10px] font-mono text-gray-400">{bank.code}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-4 border-t border-gray-100 text-center text-xs text-gray-400 flex items-center justify-center space-x-1.5 bg-white">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Secured by <b>FastPay</b> Gateway</span>
      </footer>

    </div>
  );
}
