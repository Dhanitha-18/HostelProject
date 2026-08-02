import React, { useState, useEffect, useRef } from 'react';
import { HeroBanner } from '../../components/layout/HeroBanner';
import { FEEDBACK_HERO_IMAGE } from '../../assets/heroBanners';
import { CheckCircle2, Lock, Calendar, RefreshCw } from 'lucide-react';

export const Feedback: React.FC = () => {
  // Selected feedback period (default to June 2026 which opened July 1st)
  const [selectedMonthKey, setSelectedMonthKey] = useState<'june_2026' | 'july_2026'>('june_2026');

  // Track submission status per month with persistence
  const [submittedMonths, setSubmittedMonths] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('hostel_student_feedback_submissions');
      return saved ? JSON.parse(saved) : { june_2026: false, july_2026: false };
    } catch {
      return { june_2026: false, july_2026: false };
    }
  });

  const [isSuccessToast, setIsSuccessToast] = useState(false);

  // Track iframe load count using ref to auto-detect Google Form submission
  const iframeLoadRef = useRef<number>(0);

  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc9SQrxJpOasEnr7BbArflc25hhrdEbnnTr3BJ9xDjw5cpv8A/viewform?embedded=true";

  const periods = {
    june_2026: {
      periodName: "June 2026",
      isOpen: true,
      deadline: "31 July 2026",
      nextOpenDate: "1 July 2026",
    },
    july_2026: {
      periodName: "July 2026",
      isOpen: false,
      deadline: "31 August 2026",
      nextOpenDate: "1 August 2026",
    }
  };

  const currentPeriod = periods[selectedMonthKey];
  const isSubmitted = Boolean(submittedMonths[selectedMonthKey]);

  // Save to localStorage whenever submittedMonths change
  useEffect(() => {
    try {
      localStorage.setItem('hostel_student_feedback_submissions', JSON.stringify(submittedMonths));
    } catch (e) {
      console.error(e);
    }
  }, [submittedMonths]);

  // Auto-detect when student submits the Google Form iframe
  const handleIframeLoad = () => {
    iframeLoadRef.current += 1;
    // First load (ref === 1) is initial form view.
    // Second load (ref > 1) occurs when form is submitted and Google Form redirects to response confirmation page.
    if (iframeLoadRef.current > 1 && currentPeriod.isOpen) {
      setSubmittedMonths(prev => ({ ...prev, [selectedMonthKey]: true }));
      setIsSuccessToast(true);
      setTimeout(() => setIsSuccessToast(false), 4000);
    }
  };

  // Change month handler resets iframe load counter
  const handlePeriodChange = (key: 'june_2026' | 'july_2026') => {
    setSelectedMonthKey(key);
    iframeLoadRef.current = 0;
  };

  const handleResetSubmission = () => {
    setSubmittedMonths(prev => ({ ...prev, [selectedMonthKey]: false }));
    iframeLoadRef.current = 0;
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 relative">

      {/* Hero Banner */}
      <HeroBanner 
        image={FEEDBACK_HERO_IMAGE}
        title="Student Feedback"
        subtitle="Your feedback helps us improve hostel facilities, dining quality, and maintenance services."
      />

      {/* Success Toast Notification */}
      {isSuccessToast && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-xs">Monthly feedback for {currentPeriod.periodName} submitted successfully!</span>
          </div>
          <button onClick={() => setIsSuccessToast(false)} className="text-white text-sm font-bold">✕</button>
        </div>
      )}

      {/* Month Selector / Cycle Switcher Bar */}
      <div className="bg-white border border-border p-4 rounded-2xl shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Select Monthly Feedback Cycle</h4>
            <p className="text-[11px] text-text-muted font-medium">Feedback opens on the 1st of every following month</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handlePeriodChange('june_2026')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedMonthKey === 'june_2026'
                ? 'bg-primary text-white border-primary shadow-sm font-black'
                : 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100'
            }`}
          >
            June 2026 (Open)
          </button>
          <button
            type="button"
            onClick={() => handlePeriodChange('july_2026')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedMonthKey === 'july_2026'
                ? 'bg-primary text-white border-primary shadow-sm font-black'
                : 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100'
            }`}
          >
            July 2026 (Upcoming)
          </button>
        </div>
      </div>

      {/* Student Dashboard Professional Status Card */}
      <div className="bg-white border border-border p-6 rounded-2xl shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Monthly Hostel Feedback
          </h3>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
            currentPeriod.isOpen 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {currentPeriod.isOpen ? '🟢 Open for Submission' : '🔒 Not Yet Available'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Feedback Period</span>
            <span className="text-xs font-black text-slate-900">{currentPeriod.periodName}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Availability</span>
            <span className={`text-xs font-black ${currentPeriod.isOpen ? 'text-emerald-600' : 'text-amber-600'}`}>
              {currentPeriod.isOpen ? 'Open' : 'Locked'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Deadline</span>
            <span className="text-xs font-black text-slate-900">{currentPeriod.deadline}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Status</span>
            <span className={`text-xs font-black ${isSubmitted ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isSubmitted ? 'Submitted ✓' : 'Not Submitted'}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT REGION */}

      {/* CASE 1: Period is NOT YET OPEN */}
      {!currentPeriod.isOpen && (
        <div className="bg-white border border-border p-8 sm:p-12 text-center rounded-2xl shadow-soft space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Monthly Feedback Locked</h3>
            <p className="text-xs text-text-muted font-bold">
              Feedback for {currentPeriod.periodName} is not yet open for submission.
            </p>
            <p className="text-xs text-text-muted font-medium">
              You can submit your feedback after the month ends on the 1st of next month.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 font-bold inline-block px-6">
            Next Feedback Opens: <strong className="text-amber-950 font-black">{currentPeriod.nextOpenDate}</strong>
          </div>
        </div>
      )}

      {/* CASE 2: Period IS OPEN & Already Submitted */}
      {currentPeriod.isOpen && isSubmitted && (
        <div className="bg-white border border-emerald-200 p-8 sm:p-10 text-center rounded-2xl shadow-soft space-y-6 max-w-2xl mx-auto animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 flex items-center justify-center gap-2">
              <span>✅</span> Feedback Submitted Successfully!
            </h3>
            <p className="text-xs text-text-muted font-bold mt-1">
              Thank you for sharing your feedback for {currentPeriod.periodName}.
            </p>
            <p className="text-xs text-text-muted font-medium">
              Your response has been registered and sent to the Hostel Chief Warden & Management cell.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetSubmission}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold flex items-center justify-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resubmit / Edit Feedback for {currentPeriod.periodName}</span>
            </button>
          </div>
        </div>
      )}

      {/* CASE 3: Period IS OPEN & Not Yet Submitted -> Display ONLY Embedded Google Form */}
      {currentPeriod.isOpen && !isSubmitted && (
        <div className="bg-white border border-border rounded-2xl shadow-soft overflow-hidden p-2 sm:p-4 animate-fadeIn">
          <iframe
            src={GOOGLE_FORM_URL}
            width="100%"
            height="900"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            onLoad={handleIframeLoad}
            title="Student Monthly Feedback Form"
            className="w-full rounded-xl border border-slate-100 min-h-[750px] sm:min-h-[900px]"
          >
            Loading Feedback Form...
          </iframe>
        </div>
      )}

    </div>
  );
};
