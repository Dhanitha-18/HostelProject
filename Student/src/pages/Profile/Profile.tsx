import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { User, Phone, MapPin, Building, FileText, CheckCircle2, Clock, XCircle, CreditCard, ArrowRight, ShieldAlert, X, Eye } from 'lucide-react';
import { HeroBanner } from '../../components/layout/HeroBanner';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { student, hostel, fees, paymentStatus, applicationState, backendPayments } = usePayment();
  const navigate = useNavigate();
  const [showAppFormModal, setShowAppFormModal] = useState(false);

  const isRoomAllotted = applicationState === 'room_allotted' || applicationState === 'paid';

  // Determine payment status badge info
  const getPaymentStatusInfo = () => {
    if (backendPayments && backendPayments.length > 0) {
      const latest = backendPayments[0];
      if (latest.status === 'APPROVED') {
        return { label: 'Paid & Verified by Admin', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      }
      if (latest.status === 'PENDING_REVIEW') {
        return { label: 'Paid & Under Verification', bg: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse', icon: Clock };
      }
      if (latest.status === 'REJECTED') {
        return { label: 'Payment Submission Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle };
      }
    }

    switch (paymentStatus) {
      case 'Verified':
      case 'Bed Confirmed':
        return { label: 'Fee Paid & Verified', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      case 'Waiting for Admin Verification':
        return { label: 'Waiting for Admin Verification', bg: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse', icon: Clock };
      default:
        return { label: 'Fee Pending / Unpaid', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle };
    }
  };

  // Determine application form status badge info
  const getApplicationStatusInfo = () => {
    switch (applicationState) {
      case 'paid':
        return { label: 'Approved & Admission Confirmed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, desc: 'Your application has been approved, room allotted, and fee verified.' };
      case 'room_allotted':
        return { label: 'Approved & Room Allotted', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: CheckCircle2, desc: 'Your application has been approved and a room bed has been allotted.' };
      case 'applied':
        return { label: 'Application Submitted — Under Review', bg: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse', icon: Clock, desc: 'Your application has been received and is currently under review by the Hostel Admin Board.' };
      default:
        return { label: 'Not Applied', bg: 'bg-slate-100 text-slate-600 border-slate-200', icon: ShieldAlert, desc: 'You have not submitted a hostel admission form yet.' };
    }
  };

  const paymentInfo = getPaymentStatusInfo();
  const PaymentIcon = paymentInfo.icon;

  const appStatusInfo = getApplicationStatusInfo();
  const AppStatusIcon = appStatusInfo.icon;

  return (
    <div className="space-y-6 sm:space-y-8 font-sans pb-12">
      <HeroBanner 
        image="/facilities/block4.jpeg" 
        title="Student Profile & Application Status" 
        subtitle="Track your hostel admission form status, room allotment details, and fee payment verification." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Profile Card + Official Milestone Log */}
        <div className="space-y-6">
          
          {/* Left Box 1: Student Avatar & Details Overview */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-card text-center flex flex-col items-center">
            {/* Avatar Profile Circle */}
            <div className="w-24 h-24 rounded-full bg-primary/10 text-primary border-4 border-primary/20 flex items-center justify-center font-black text-3xl shadow-inner mb-4 uppercase">
              {student.name ? student.name.charAt(0) : 'S'}
            </div>

            <h3 className="text-base font-black text-slate-800 tracking-tight leading-none">{student.name}</h3>
            {student.usn && !student.usn.startsWith('APP-') && (
              <p className="text-xs text-text-muted font-bold font-mono mt-1.5">{student.usn}</p>
            )}

            {/* Quick Badges */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {applicationState === 'paid' && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Confirmed Resident
                </span>
              )}
              {applicationState === 'room_allotted' && (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3 h-3" /> Room Allotted
                </span>
              )}
              {applicationState === 'applied' && (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" /> Application Pending
                </span>
              )}
              {applicationState === 'not_applied' && (
                <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Not Applied
                </span>
              )}
            </div>

            {/* Formatted Department & Contact List (Fits full department name cleanly) */}
            <div className="w-full border-t border-slate-100 mt-5 pt-4 space-y-3.5 text-xs text-left font-semibold">
              <div className="space-y-0.5">
                <span className="text-[10px] text-text-muted uppercase tracking-wider block font-bold">Department</span>
                <span className="text-slate-900 font-bold block text-xs leading-snug break-words">{student.department}</span>
              </div>
              
              <div className="space-y-0.5 border-t border-slate-100/60 pt-2.5">
                <span className="text-[10px] text-text-muted uppercase tracking-wider block font-bold">Semester / Year</span>
                <span className="text-slate-900 font-bold block text-xs">Sem {student.semester} (Year {student.year})</span>
              </div>

              <div className="space-y-0.5 border-t border-slate-100/60 pt-2.5">
                <span className="text-[10px] text-text-muted uppercase tracking-wider block font-bold">Email Address</span>
                <span className="text-slate-900 font-bold font-mono block text-xs break-all">{student.email}</span>
              </div>
            </div>
          </div>

          {/* Left Box 2: Official Milestone Log (Placed directly under Student Info card) */}
          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              OFFICIAL MILESTONE LOG
            </h3>

            <div className="relative pl-6 space-y-4 font-sans text-xs">
              {/* Timeline vertical bar */}
              <div className="absolute top-2 bottom-2 left-[9px] w-[2px] bg-slate-200" />

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full border-2 border-white shrink-0 shadow-xs ${
                    applicationState !== 'not_applied' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                  <span className={`uppercase text-[10px] font-black tracking-wider ${
                    applicationState !== 'not_applied' ? 'text-emerald-600' : 'text-slate-400'
                  }`}>SUBMITTED</span>
                </div>
                <span className="text-text-muted font-medium text-[11px] whitespace-nowrap">
                  {applicationState !== 'not_applied' ? '10 July 2026' : 'Pending'}
                </span>
              </div>

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full border-2 border-white shrink-0 shadow-xs ${
                    applicationState === 'room_allotted' || applicationState === 'paid' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                  <span className={`uppercase text-[10px] font-black tracking-wider ${
                    applicationState === 'room_allotted' || applicationState === 'paid' ? 'text-emerald-600' : 'text-slate-400'
                  }`}>APPROVED</span>
                </div>
                <span className="text-text-muted font-medium text-[11px] whitespace-nowrap">
                  {applicationState === 'room_allotted' || applicationState === 'paid' ? '10 July 2026' : 'Pending'}
                </span>
              </div>

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full border-2 border-white shrink-0 shadow-xs ${
                    backendPayments && backendPayments.length > 0 ? 'bg-emerald-500' : 'bg-primary'
                  }`} />
                  <span className={`uppercase text-[10px] font-black tracking-wider ${
                    backendPayments && backendPayments.length > 0 ? 'text-emerald-600' : 'text-primary'
                  }`}>PAYMENT</span>
                </div>
                <span className="text-text-muted font-medium text-[11px] whitespace-nowrap">
                  {backendPayments && backendPayments.length > 0 ? 'Submitted' : 'Pending Settle'}
                </span>
              </div>

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full border-2 border-white shrink-0 shadow-xs ${
                    applicationState === 'paid' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                  <span className={`uppercase text-[10px] font-black tracking-wider ${
                    applicationState === 'paid' ? 'text-emerald-600' : 'text-slate-500'
                  }`}>VERIFIED</span>
                </div>
                <span className="text-text-muted font-medium text-[11px] whitespace-nowrap">
                  {applicationState === 'paid' ? 'Verified' : 'Awaiting Sign'}
                </span>
              </div>

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full border-2 border-white shrink-0 shadow-xs ${
                    applicationState === 'paid' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                  <span className={`uppercase text-[10px] font-black tracking-wider ${
                    applicationState === 'paid' ? 'text-emerald-600' : 'text-slate-500'
                  }`}>BED CONFIRMED</span>
                </div>
                <span className="text-text-muted font-medium text-[11px] whitespace-nowrap">
                  {applicationState === 'paid' ? 'Confirmed' : 'Pending Lock'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: ALL STATUSES CONSOLIDATED INTO ONE UNIFIED CARD */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-card space-y-8">
            
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Student Admission & Portal Status
                </h3>
                <p className="text-xs text-text-muted font-medium mt-0.5">Real-time status overview of your application form, room bed allotment, and payment verification.</p>
              </div>

              {applicationState !== 'not_applied' && (
                <button
                  type="button"
                  onClick={() => setShowAppFormModal(true)}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Filled Application Form</span>
                </button>
              )}
            </div>

            {/* Sub-Section 1: Hostel Admission Form Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  1. Admission Form Status
                </h4>
                {applicationState === 'not_applied' ? (
                  <button
                    onClick={() => navigate('/apply')}
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition-all"
                  >
                    <span>Fill Application Form</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${appStatusInfo.bg}`}>
                    <AppStatusIcon className="w-3 h-3" />
                    {appStatusInfo.label}
                  </span>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block">Form Submission Status</span>
                    <span className="text-slate-900 font-bold block mt-0.5">
                      {applicationState === 'not_applied' ? 'Form Not Submitted' : 'Submitted & Registered'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block">Admin Board Review</span>
                    <span className="text-slate-900 font-bold block mt-0.5">
                      {applicationState === 'not_applied' ? 'Pending Submission' : 
                       applicationState === 'applied' ? 'Under Review' : 'Approved & Processed'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-200/60">
                  {appStatusInfo.desc}
                </p>
              </div>
            </div>

            {/* Sub-Section 2: Room & Bed Allotment Details */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  2. Room Allotment & Hostel Status
                </h4>
                {applicationState === 'not_applied' && (
                  <button
                    onClick={() => navigate('/apply')}
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition-all"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block">Hostel Residence</span>
                  <span className="text-slate-900 font-bold block text-sm">
                    {isRoomAllotted ? hostel.hostel : 'OM SAI LUXURY LADIES PG'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block">Block & Floor</span>
                  <span className="text-slate-900 font-bold block text-sm">
                    {isRoomAllotted ? `Block ${hostel.block} • Floor ${hostel.floor}` : 'Awaiting Allocation'}
                  </span>
                </div>
                <div className="space-y-1 border-t border-slate-200/60 pt-2.5">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block">Room Number & Bed</span>
                  <span className="text-slate-900 font-bold block font-mono text-sm">
                    {isRoomAllotted ? `Room ${hostel.room} • Bed ${hostel.bed}` : 'Awaiting Allocation'}
                  </span>
                </div>
                <div className="space-y-1 border-t border-slate-200/60 pt-2.5">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block">Sharing Type</span>
                  <span className="text-slate-900 font-bold block text-sm">
                    {isRoomAllotted ? hostel.sharing : 'Standard Sharing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Section 3: Fee Payment Verification Status */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  3. Fee Payment Verification Status
                </h4>
                <button
                  onClick={() => navigate('/payment')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1 border border-slate-200 transition-all"
                >
                  <span>Payment Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[9px] text-text-muted uppercase tracking-wider block">Verification Status</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border mt-1.5 ${paymentInfo.bg}`}>
                    <PaymentIcon className="w-3 h-3" />
                    {paymentInfo.label}
                  </span>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl">
                  <span className="text-[9px] text-emerald-800 uppercase tracking-wider block font-bold">Settled Amount</span>
                  <span className="text-base font-black text-emerald-700 mt-1 block">₹{fees.paid.toLocaleString()}</span>
                </div>
                <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
                  <span className="text-[9px] text-rose-800 uppercase tracking-wider block font-bold">Remaining Balance</span>
                  <span className="text-base font-black text-rose-700 mt-1 block">₹{fees.remaining.toLocaleString()}</span>
                </div>
              </div>

              {/* Submitted Payment UTR Proof Records */}
              {backendPayments && backendPayments.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Submitted Payment Proof Records</span>
                  <div className="space-y-2">
                    {backendPayments.map((p: any) => (
                      <div key={p.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs font-semibold space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono font-bold text-slate-800">UTR: {p.utrNumber}</p>
                            <p className="text-[10px] text-text-muted">{new Date(p.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            p.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            p.status === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {p.status === 'APPROVED' ? 'VERIFIED' : p.status === 'PENDING_REVIEW' ? 'UNDER REVIEW' : 'REJECTED'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sub-Section 4: Personal & Emergency Contacts */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                4. Personal & Emergency Contacts
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    Primary Mobile Number
                  </span>
                  <span className="text-slate-900 font-bold block">{student.phone}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Parent Contact
                  </span>
                  <span className="text-slate-900 font-bold block">{student.parentContact}</span>
                </div>
                <div className="space-y-1 border-t border-slate-200/60 pt-2.5 sm:col-span-2">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Home Address
                  </span>
                  <span className="text-slate-900 font-bold block leading-relaxed">{student.address}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modal: View Filled Application Form */}
      {showAppFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Filled Hostel Admission Form
                  </h3>
                  <p className="text-[11px] text-text-muted">Official application form details submitted for hostel residence.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAppFormModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="space-y-5 text-xs font-semibold">
              
              {/* Personal Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-wider block border-b border-slate-200/60 pb-1">
                  1. Student Personal Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">Full Name</span>
                    <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">USN / Roll Number</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {student.usn && !student.usn.startsWith('APP-') ? student.usn : 'Registered Student'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">Department / Branch</span>
                    <span className="font-bold text-slate-900">{student.department}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">Academic Year & Sem</span>
                    <span className="font-bold text-slate-900">Semester {student.semester} (Year {student.year})</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">Primary Mobile</span>
                    <span className="font-bold text-slate-900">{student.phone}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">Email Address</span>
                    <span className="font-bold text-slate-900 font-mono">{student.email}</span>
                  </div>
                </div>
              </div>

              {/* Family & Emergency Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-wider block border-b border-slate-200/60 pb-1">
                  2. Parent & Emergency Contact Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">Parent / Guardian Contact</span>
                    <span className="font-bold text-slate-900">{student.parentContact}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">Hostel Preference</span>
                    <span className="font-bold text-slate-900">OM SAI LUXURY PG (BMSIT Partner)</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-text-muted text-[10px] uppercase block">Residential Home Address</span>
                    <span className="font-bold text-slate-900 leading-relaxed">{student.address}</span>
                  </div>
                </div>
              </div>

              {/* Submission Status Note */}
              <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl text-[11px] text-slate-700 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Form submission is verified and locked on the Hostel Admin System database.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAppFormModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded-xl text-xs transition-colors"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
