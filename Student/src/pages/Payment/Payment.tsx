import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { HeroBanner } from '../../components/layout/HeroBanner';
import { 
  Building,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeGj_HFh1FvceJCVuQhY7L4dY74CjjjjHccehN69MDOg6-Egw/viewform';

export const Payment: React.FC = () => {
  const { fees, student, hostel, setFees, applicationState, setApplicationState } = usePayment();

  // Single payment status state: new applicants start with pending, existing residents start with paid & verified
  const [status, setStatus] = useState<'pending' | 'paid & under verification' | 'paid & verified'>(() => {
    return applicationState === 'applied' || applicationState === 'room_allotted' ? 'pending' : 'paid & verified';
  });

  // Copy success indicator
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Synchronize dynamic paid amounts with the top card consolidated fees
  useEffect(() => {
    const isPaid = status === 'paid & verified';
    setFees(prev => ({
      ...prev,
      paid: isPaid ? 143000 : 0,
      remaining: isPaid ? 0 : 143000
    }));

    // If payment is verified, transition applicationState to 'paid' (unlocks full dashboard access)
    if (isPaid && applicationState !== 'paid') {
      setApplicationState('paid');
    }
  }, [status, setFees, applicationState, setApplicationState]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleFillFormClick = () => {
    window.open(GOOGLE_FORM_URL, '_blank', 'noopener,noreferrer');
    if (status === 'pending') {
      setStatus('paid & under verification');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans relative pb-12">
      <HeroBanner 
        image="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"
        title="PG Accounts Payment Hub"
        subtitle="Settle hostel fee payments via bank transfer and track verification statuses"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hostel Allotted Details Card */}
        <div className="bg-white border border-border p-6 rounded-2xl shadow-soft space-y-4">
          <div>
            <h3 className="text-xs font-black text-text uppercase tracking-wider">Hostel Allotted Details</h3>
            <p className="text-[10px] text-text-muted mt-0.5 font-semibold">Your approved residential assignment</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-semibold text-text">
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Student Name</span>
              <span className="font-bold">{student.name}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Allotted Wing</span>
              <span className="font-bold">{hostel.hostel}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Block / Floor</span>
              <span className="font-bold">Block {hostel.block} • {hostel.floor}rd Floor</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Room / Bed Assignment</span>
              <span className="font-bold font-mono">Room {hostel.room} • Bed {hostel.bed}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Room / Sharing Type</span>
              <span className="font-bold">AC Executive • {hostel.sharing}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Admission Date</span>
              <span className="font-bold">{hostel.admissionDate}</span>
            </div>
            <div className="flex justify-between py-2.5 items-center">
              <span className="text-text-muted">PG Booking Status</span>
              <span className="bg-success/15 text-success border border-success/20 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                Confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Fee Summary Card */}
        <div className="lg:col-span-2 bg-white border border-border p-6 rounded-2xl shadow-soft space-y-6">
          <div>
            <h3 className="text-xs font-black text-text uppercase tracking-wider">Admission Fee Summary</h3>
            <p className="text-[10px] text-text-muted mt-0.5 font-semibold">Consolidated fee structure details</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider block">Hostel Rent</span>
              <span className="text-sm font-black text-slate-800 mt-1 block">₹95,000</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider block">Security Deposit</span>
              <span className="text-sm font-black text-slate-800 mt-1 block">₹15,000</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider block">Annual Mess Fee</span>
              <span className="text-sm font-black text-slate-800 mt-1 block">₹30,000</span>
            </div>
            <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl">
              <span className="text-[8.5px] font-black text-primary uppercase tracking-wider block font-sans">Total Fee</span>
              <span className="text-sm font-black text-primary mt-1 block">₹1,40,000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-5 text-xs font-semibold">
            <div className="flex flex-col">
              <span className="text-text-muted text-[10px]">Already Settled:</span>
              <span className="text-success font-black text-sm mt-0.5">₹{fees.paid.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-muted text-[10px]">Remaining Balance:</span>
              <span className="text-danger font-black text-sm mt-0.5">₹{fees.remaining.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-muted text-[10px]">Final Due Date:</span>
              <span className="text-slate-800 font-bold text-sm mt-0.5">30 July 2026</span>
            </div>
          </div>
        </div>

      </div>

      {/* 1. BANK DETAILS FOR ONLINE TRANSACTION */}
      <div className="bg-white border border-border p-6 rounded-2xl shadow-soft space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-black text-text uppercase tracking-wider">Bank Details for the Online Transaction</h3>
            <p className="text-[10px] text-text-muted mt-0.5 font-semibold">Make transfers using net banking or mobile apps to the official account</p>
          </div>
          <Building className="w-5 h-5 text-primary shrink-0" />
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-bold text-xs space-y-3.5 text-text">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1 relative group">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Name of the A/c holder</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-extrabold block">The Principal BMSIT & M Outsourced Hostel SB A/C</span>
                <button 
                  onClick={() => handleCopy("The Principal BMSIT & M Outsourced Hostel SB A/C", "holder")}
                  className="p-1 hover:bg-slate-200 rounded transition-colors text-text-muted hover:text-slate-800"
                  title="Copy Holder Name"
                  type="button"
                >
                  {copiedField === 'holder' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">SB A/c No</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-850 font-black block font-mono text-sm tracking-wide">50495632400</span>
                <button 
                  onClick={() => handleCopy("50495632400", "acc")}
                  className="p-1 hover:bg-slate-200 rounded transition-colors text-text-muted hover:text-slate-800"
                  title="Copy Account Number"
                  type="button"
                >
                  {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">IFSC</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-850 font-black block font-mono text-sm tracking-wide">IDIB000A682</span>
                <button 
                  onClick={() => handleCopy("IDIB000A682", "ifsc")}
                  className="p-1 hover:bg-slate-200 rounded transition-colors text-text-muted hover:text-slate-800"
                  title="Copy IFSC Code"
                  type="button"
                >
                  {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Bank Name</span>
              <span className="text-slate-800 font-extrabold block">Indian Bank</span>
            </div>

            <div className="space-y-1 col-span-full">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Branch</span>
              <span className="text-slate-800 font-extrabold block">Avalahalli, Bangalore</span>
            </div>

          </div>
        </div>

        <div className="border-t border-slate-100 pt-4.5 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Read the points carefully before making the fee transfer</h4>
          <ol className="list-decimal pl-4.5 text-[11px] font-semibold text-text-muted space-y-2 leading-relaxed">
            <li>IMPS / Neft / Mobile Banking is Allowed.</li>
            <li>Hostel & Mess fee should be paid to the below mentioned account only.</li>
          </ol>
        </div>
      </div>

      {/* 2. PG ACCOUNTS INVOICES LEDGER */}
      <div className="bg-white border border-border p-6 rounded-2xl shadow-soft space-y-4">
        <div>
          <h3 className="text-xs font-black text-text uppercase tracking-wider">PG Accounts Invoices Ledger</h3>
          <p className="text-[10px] text-text-muted mt-0.5 font-semibold">Track outstanding fee components and submit bank transfer details</p>
        </div>

        <div className="overflow-x-auto text-xs font-semibold">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-[9px] font-bold text-text-muted uppercase tracking-wider">
                <th className="p-3">Payment Details</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Single Payment Record: Hostel Fees */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-3">
                  <p className="font-bold text-slate-850">Hostel Fees</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Hostel Admission Fee</p>
                </td>
                <td className="p-3 text-right font-mono font-bold text-slate-800">₹1,43,000</td>
                <td className="p-3 text-center">
                  {status === 'pending' && (
                    <span className="inline-block text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                      Pending
                    </span>
                  )}
                  {status === 'paid & under verification' && (
                    <span className="inline-block text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-amber-50 text-warning border-amber-250 animate-pulse">
                      paid & under verification
                    </span>
                  )}
                  {status === 'paid & verified' && (
                    <span className="inline-block text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-emerald-50 text-success border-emerald-250">
                      paid & verified
                    </span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <button
                      onClick={handleFillFormClick}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3.5 rounded-lg text-[10px] shadow-sm transition-all flex items-center gap-1.5 mx-auto"
                      type="button"
                    >
                      <span>Fill Hostel Fee Form</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    {status === 'paid & under verification' && (
                      <button
                        onClick={() => setStatus('paid & verified')}
                        className="text-[9px] bg-slate-100 hover:bg-blue-50 text-primary hover:text-primary-dark border border-slate-200 px-2 py-0.5 rounded transition-colors font-black uppercase tracking-wider mt-0.5"
                        title="Simulate Admin verification process"
                        type="button"
                      >
                        Verify (Admin Sim)
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
