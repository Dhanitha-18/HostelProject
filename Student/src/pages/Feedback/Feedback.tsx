import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../../components/layout/HeroBanner';
import { usePayment } from '../../context/PaymentContext';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, Lock, Calendar, Star, Send,
  MessageSquare, RefreshCw
} from 'lucide-react';

interface SubmittedFeedbackRecord {
  periodKey: string;
  periodName: string;
  ratings: Record<string, number>;
  comments: string;
  submittedAt: string;
}

export const Feedback: React.FC = () => {
  const { student } = usePayment();
  const [selectedMonthKey, setSelectedMonthKey] = useState<'june_2026' | 'july_2026'>('june_2026');

  // Fetch categories from backend
  const { data: categories = [] } = useQuery({
    queryKey: ['feedbackCategories'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/feedback-categories');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  const [submittedMonths, setSubmittedMonths] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('hostel_student_feedback_submissions');
      return saved ? JSON.parse(saved) : { june_2026: false, july_2026: false };
    } catch {
      return { june_2026: false, july_2026: false };
    }
  });

  const [feedbackLogs, setFeedbackLogs] = useState<{ [key: string]: SubmittedFeedbackRecord }>(() => {
    try {
      const saved = localStorage.getItem('hostel_student_feedback_logs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  // Initialize ratings when categories load
  useEffect(() => {
    if (categories.length > 0 && Object.keys(ratings).length === 0) {
      const initial: Record<string, number> = {};
      categories.forEach((cat: any) => initial[cat.name] = 5);
      setRatings(initial);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('hostel_student_feedback_submissions', JSON.stringify(submittedMonths));
    } catch (e) {
      console.error(e);
    }
  }, [submittedMonths]);

  useEffect(() => {
    try {
      localStorage.setItem('hostel_student_feedback_logs', JSON.stringify(feedbackLogs));
    } catch (e) {
      console.error(e);
    }
  }, [feedbackLogs]);

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
  const submittedRecord = feedbackLogs[selectedMonthKey];

  const handlePeriodChange = (key: 'june_2026' | 'july_2026') => {
    setSelectedMonthKey(key);
  };

  const markAsSubmitted = async (ratingsObj: Record<string, number>, commentsText: string) => {
    const record: SubmittedFeedbackRecord = {
      periodKey: selectedMonthKey,
      periodName: currentPeriod.periodName,
      ratings: ratingsObj,
      comments: commentsText,
      submittedAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    try {
      await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student?.name || 'Unknown Student',
          usn: student?.usn || 'Unknown USN',
          periodName: currentPeriod.periodName,
          ratings: ratingsObj,
          comments: commentsText
        })
      });
      setSubmittedMonths(prev => ({ ...prev, [selectedMonthKey]: true }));
      setFeedbackLogs(prev => ({ ...prev, [selectedMonthKey]: record }));
      setIsSuccessToast(true);
      setTimeout(() => setIsSuccessToast(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNativeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markAsSubmitted(ratings, comments);
  };

  const handleResetSubmission = () => {
    setSubmittedMonths(prev => ({ ...prev, [selectedMonthKey]: false }));
  };

  const handleStarClick = (categoryName: string, starValue: number) => {
    setRatings(prev => ({ ...prev, [categoryName]: starValue }));
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 relative">

      <HeroBanner
        image="/facilities/block4.jpeg"
        title="Student Feedback"
        subtitle="Your feedback helps us improve hostel facilities, dining quality, and maintenance services."
      />

      {isSuccessToast && (
        <div className="bg-success text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-xs">Monthly feedback for {currentPeriod.periodName} submitted successfully!</span>
          </div>
          <button onClick={() => setIsSuccessToast(false)} className="text-white text-sm font-bold">✕</button>
        </div>
      )}

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
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border \${selectedMonthKey === 'june_2026'
                ? 'bg-primary text-white border-primary shadow-sm font-black'
                : 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100'
              }`}
          >
            June 2026 (Open)
          </button>
          <button
            type="button"
            onClick={() => handlePeriodChange('july_2026')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border \${selectedMonthKey === 'july_2026'
                ? 'bg-primary text-white border-primary shadow-sm font-black'
                : 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100'
              }`}
          >
            July 2026 (Upcoming)
          </button>
        </div>
      </div>

      <div className="bg-white border border-border p-6 rounded-2xl shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Monthly Hostel Feedback
          </h3>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border \${currentPeriod.isOpen
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
            <span className={`text-xs font-black \${currentPeriod.isOpen ? 'text-emerald-600' : 'text-amber-600'}`}>
              {currentPeriod.isOpen ? 'Open' : 'Locked'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Deadline</span>
            <span className="text-xs font-black text-slate-900">{currentPeriod.deadline}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Status</span>
            <span className={`text-xs font-black \${isSubmitted ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isSubmitted ? 'Submitted ✓' : 'Not Submitted'}
            </span>
          </div>
        </div>
      </div>

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

          {submittedRecord && (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-left space-y-3 text-xs font-semibold">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 text-[10.5px]">
                <span className="text-text-muted font-bold uppercase">Submission Receipt</span>
                <span className="font-mono text-slate-700">{submittedRecord.submittedAt}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {Object.entries(submittedRecord.ratings || {}).map(([cat, rating]) => (
                  <div key={cat} className="capitalize">
                    {cat}: <strong className="text-warning">★ {rating}/5</strong>
                  </div>
                ))}
              </div>

              {submittedRecord.comments && (
                <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-700">
                  <span className="text-text-muted font-bold block text-[9.5px] uppercase">Submitted Comments:</span>
                  <p className="italic mt-0.5">"{submittedRecord.comments}"</p>
                </div>
              )}
            </div>
          )}

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

      {currentPeriod.isOpen && !isSubmitted && (
        <div className="space-y-6">

          <div className="bg-white border border-border p-6 sm:p-8 rounded-2xl shadow-soft space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Monthly Hostel Service Rating Form ({currentPeriod.periodName})
                </h3>
                <p className="text-[11px] text-text-muted font-semibold mt-0.5">
                  Rate your satisfaction across key hostel facilities. All responses are confidential.
                </p>
              </div>

              <form onSubmit={handleNativeFormSubmit} className="space-y-6 text-xs font-semibold">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map((cat: any) => (
                    <div key={cat.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-slate-800 text-xs capitalize">{cat.name}</span>
                        <span className="font-mono text-xs font-black text-warning">★ {ratings[cat.name] || 5}/5</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleStarClick(cat.name, star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star className={`w-6 h-6 \${star <= (ratings[cat.name] || 5) ? 'fill-warning text-warning' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Detailed Suggestions & Feedback Comments</label>
                  <textarea
                    rows={4}
                    placeholder="Share any specific improvements, meal suggestions, or warden feedback..."
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    className="w-full border border-border rounded-xl p-3 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-black py-3.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit {currentPeriod.periodName} Feedback Application</span>
                </button>

              </form>
            </div>

        </div>
      )}

    </div>
  );
};