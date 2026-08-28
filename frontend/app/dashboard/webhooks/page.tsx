'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Webhook, ChevronRight, AlertCircle, FileCode, CheckCircle2 } from 'lucide-react';

const MOCK_WEBHOOK_EVENTS = [
  {
    id: 'evt_wh_1001',
    provider: 'RAZORPAY',
    paymentId: 'pay_11111111-1111-1111-1111-111111111111',
    signatureValid: true,
    processed: true,
    receivedAt: new Date(Date.now() - 3600000).toISOString(),
    rawPayload: '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_11111111","amount":50000,"status":"captured"}}}}',
  },
  {
    id: 'evt_wh_1002',
    provider: 'MOCK_PROVIDER',
    paymentId: 'pay_22222222-2222-2222-2222-222222222222',
    signatureValid: true,
    processed: true,
    receivedAt: new Date(Date.now() - 7200000).toISOString(),
    rawPayload: '{"event":"payment.failed","payload":{"payment":{"entity":{"id":"pay_22222222","amount":150000,"status":"failed"}}}}',
  },
];

export default function WebhooksDashboardPage() {
  const [selectedEvent, setSelectedEvent] = useState<typeof MOCK_WEBHOOK_EVENTS[0] | null>(
    MOCK_WEBHOOK_EVENTS[0]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Webhooks & Event Log</h1>
        <p className="text-xs text-slate-400 mt-1">Inbound gateway event notifications and signature verification history</p>
      </div>

      {/* Backend Gap Notice */}
      <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 flex items-start space-x-2.5">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Backend Ingestion Record Note:</span> Webhooks are ingested asynchronously into MySQL Historian. Delivery retry history by event is noted as a backend gap; raw payloads are rendered below.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events List */}
        <Card className="p-4">
          <h2 className="font-bold text-slate-100 text-sm mb-4">Inbound Events List</h2>

          <div className="space-y-2">
            {MOCK_WEBHOOK_EVENTS.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedEvent?.id === event.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-slate-100 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Webhook className="h-4 w-4 text-emerald-400" />
                    <span className="font-mono font-semibold">{event.id}</span>
                  </div>
                  <Badge variant={event.signatureValid ? 'emerald' : 'rose'}>
                    {event.signatureValid ? 'VALID SIG' : 'INVALID SIG'}
                  </Badge>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Provider: {event.provider}</span>
                  <span>{new Date(event.receivedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Raw Payload Detail View */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
              <FileCode className="h-4 w-4 text-violet-400" />
              <span>Raw Event Payload</span>
            </h2>
            <Badge variant="violet">{selectedEvent?.provider || 'EVENT'}</Badge>
          </div>

          {selectedEvent ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1.5 text-slate-400">
                <div>Event ID: <span className="text-slate-200">{selectedEvent.id}</span></div>
                <div>Payment Ref: <span className="text-emerald-400">{selectedEvent.paymentId}</span></div>
                <div>Signature Status: <span className="text-emerald-400">HMAC-SHA256 Verified</span></div>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(JSON.parse(selectedEvent.rawPayload), null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">Select a webhook event to inspect its raw payload.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
