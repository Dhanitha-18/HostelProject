import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../../context/PaymentContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  Receipt
} from 'lucide-react';
import { apiRequest, API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SLIDE_IMAGES = [
  {
    url: "/facilities/hero1.jpg",
    title: 'Welcome to OM SAI PG',
    subtitle: 'Sri Shyla Nilaya — A premium, modern residence partnered with BMSIT&M'
  },
  {
    url: "/facilities/hero2.png",
    title: 'SVS Nilaya Branch',
    subtitle: 'Fully furnished rooms designed for academic focus and comfort'
  },
  {
    url: "/facilities/hero_building3.png",
    title: 'Vista Branch',
    subtitle: 'High-speed Wi-Fi zones, modern amenities, and 24/7 security'
  }
];

const PG_FEATURE_SECTIONS: Array<{
  id: string;
  title: string;
  description: string;
  mainImage: string;
  subImage: string;
  route: string;
  mainImageStyle?: React.CSSProperties;
  subImageStyle?: React.CSSProperties;
}> = [
  {
    id: 'dining',
    title: 'Hygienic Dining & Quality Food',
    description: 'We prioritize student health and nutrition with a rich four-meal daily menu. Our in-house kitchen serves hot, freshly prepared vegetarian meals under strict hygiene standards. All cooking water undergoes multi-stage filtration to ensure 100% purity.',
    mainImage: '/facilities/hygiene_food.jpg',
    subImage: '/facilities/block2.jpeg',
    route: '/mess'
  },
  {
    id: 'rooms',
    title: 'Furnished Rooms & Study Spaces',
    description: 'Designed for academic concentration and peaceful living, our rooms come equipped with individual study desks, comfortable mattresses, spacious wardrobes, and high-speed Wi-Fi. Quiet lounge spaces are available on every floor for group discussions.',
    mainImage: '/facilities/block1.jpeg',
    subImage: '/facilities/room_desks.png',
    route: '/facilities'
  },
  {
    id: 'security',
    title: '24/7 Security & Safety Protocols',
    description: 'Student safety is our top priority. We enforce round-the-clock CCTV surveillance across all corridors and entry points, night curfew checks, and on-site resident warden support coordinated with BMSIT&M hostel administration.',
    mainImage: '/facilities/cctv.jpeg',
    subImage: '/facilities/block4.jpeg',
    route: '/facilities'
  },
  {
    id: 'housekeeping',
    title: 'Housekeeping & Laundry Services',
    description: 'Enjoy hassle-free residential living with daily room sweeping, bathroom sanitization, and scheduled laundry pickup. Continuous RO drinking water units and 100kVA generator power backups ensure zero interruptions to your daily routine.',
    mainImage: '/facilities/cleaning2.jpeg',
    mainImageStyle: { objectPosition: 'center 0%' },
    subImage: '/facilities/washingmachine.jpeg',
    route: '/facilities'
  }
];

export const Overview: React.FC = () => {
  const { applicationState, student, hostel, paymentStatus, refreshStatus } = usePayment();
  const { studentUsn } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Payment form states
  const [utr, setUtr] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-carousel timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDE_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotFile) {
      alert('Payment screenshot is mandatory!');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Upload screenshot
      const formData = new FormData();
      formData.append('photo', screenshotFile);

      const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Screenshot upload failed. Please try again.');
      }

      const uploadData = await uploadRes.json();
      const screenshotUrl = uploadData.imageUrl;

      // 2. Submit payment details
      await apiRequest('/api/student/payment', {
        method: 'POST',
        body: JSON.stringify({
          studentName: student.name,
          studentUsn: studentUsn || student.usn,
          utrNumber: utr,
          paymentDate: paymentDate,
          hostelName: hostel.hostel || 'OM SAI PG',
          block: hostel.block || 'A',
          floor: String(hostel.floor || '1'),
          roomNumber: hostel.room || '101',
          screenshotUrl,
        })
      });
      alert('Payment details submitted successfully! Awaiting verification.');
      refreshStatus();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 animate-fadeIn pb-16">
      
      {/* 1. HERO SECTION — Seamless Layout without White Card Frame */}
      <div className="relative overflow-hidden -mt-1 mb-8">
        
        {/* Soft ambient gradient accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Content */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Affiliated Housing Partner</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight uppercase leading-[1.1]">
                OM SAI LUXURY PGS
              </h1>
              <p className="text-base sm:text-lg font-bold text-primary uppercase tracking-wider">
                {SLIDE_IMAGES[currentSlide].title}
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {SLIDE_IMAGES[currentSlide].subtitle} — Premium off-campus student residence partnered with BMSIT&M. Fully furnished rooms, 24/7 security, 4-meal daily dining, and high-speed Wi-Fi.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {applicationState === 'not_applied' && (
                <button
                  onClick={() => navigate('/apply')}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-7 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                  type="button"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}

              <button
                onClick={() => navigate('/facilities')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider border border-slate-200 transition-all flex items-center gap-2"
                type="button"
              >
                <Building2 className="w-4 h-4 text-primary" />
                <span>Facilities</span>
              </button>
            </div>
          </div>

          {/* Right Building Showcase Container */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <div className="w-full h-[480px] sm:h-[540px] lg:h-[580px] rounded-2xl bg-slate-50 shadow-xl relative overflow-hidden flex items-center justify-center border border-slate-200 group">
              
              {/* Building Image — fills the inner box */}
              <div className="relative z-10 w-full h-full">
                {SLIDE_IMAGES.map((slide, index) => (
                  <img
                    key={slide.url}
                    src={slide.url}
                    alt={slide.title}
                    style={{ animation: 'float 4s ease-in-out infinite' }}
                    className={`w-full h-full object-cover rounded-xl transition-all duration-700 ease-in-out ${
                      index === currentSlide ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none'
                    }`}
                  />
                ))}
              </div>

              {/* Slider Controls */}
              <button
                onClick={() => setCurrentSlide(prev => (prev === 0 ? SLIDE_IMAGES.length - 1 : prev - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-slate-800 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 z-20 border border-slate-200 shadow-md"
                aria-label="Previous Slide"
                type="button"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % SLIDE_IMAGES.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-slate-800 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 z-20 border border-slate-200 shadow-md"
                aria-label="Next Slide"
                type="button"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {SLIDE_IMAGES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-primary w-7' : 'bg-slate-400/50 hover:bg-slate-500 w-2.5'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    type="button"
                  />
                ))}
              </div>

              {/* Building Branch Tag */}
              <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{SLIDE_IMAGES[currentSlide].title}</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 2. ABOUT US SECTION — Concise Left-Aligned Single Block */}
      <section className="space-y-4 text-left px-2">
        <div>
          <span className="text-xs font-black text-primary uppercase tracking-[0.25em] block mb-1">
            Quality Housing Partner
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 tracking-wide uppercase">
            ABOUT US
          </h2>
        </div>

        <p className="text-slate-700 text-base sm:text-lg leading-[1.85] font-normal max-w-full">
          <strong>OM SAI LUXURY PGS</strong> is a premier off-campus student accommodation officially affiliated with <strong>BMS Institute of Technology & Management (BMSIT&M)</strong>, offering fully furnished twin and triple sharing rooms. We provide a wholesome 4-meal daily dining service prepared under strict hygiene standards, 24/7 CCTV surveillance, continuous 100kVA power backup, commercial RO-purified drinking water, daily housekeeping, and high-speed Wi-Fi on every floor. With full-time warden support from Mr. Raghu and Ms. Harika, our residents enjoy a safe, disciplined, and comfortable living environment just minutes from the BMSIT&M campus.
        </p>
      </section>

      {/* 3. APPLY / PAYMENT SECTION */}
      {applicationState === 'room_allotted' ? (
        <section className="bg-white border border-emerald-200 p-6 sm:p-8 rounded-2xl shadow-soft space-y-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
              <Receipt className="w-48 h-48 text-emerald-600" />
           </div>
           
           <div className="relative z-10">
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
               <CheckCircle2 className="w-6 h-6 text-emerald-500" />
               {paymentStatus === 'Waiting for Admin Verification' ? 'Payment Under Verification' : 'Room Allotted — Complete Your Payment'}
             </h3>
             <p className="text-sm text-slate-600 mt-1 font-medium">
               {paymentStatus === 'Waiting for Admin Verification' 
                 ? 'Your payment details have been submitted and are currently being reviewed by our administrative team. You will be notified once verified.' 
                 : 'Your bed is secured! Submit your initial admission fee bank transaction details below to unlock the student portal.'}
             </p>
           </div>
           
           {paymentStatus !== 'Waiting for Admin Verification' && (
           <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">UTR / Reference Number *</label>
                <input required type="text" value={utr} onChange={e=>setUtr(e.target.value)} placeholder="e.g. UPI123456789" className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow" />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Date *</label>
                <input required type="date" value={paymentDate} onChange={e=>setPaymentDate(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow" />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Screenshot *</label>
                <input required type="file" accept="image/*" onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    setScreenshotFile(e.target.files[0]);
                  }
                }} className="w-full border border-slate-300 rounded-xl p-2 bg-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow" />
             </div>
             <div className="space-y-1 flex items-end">
                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                   <span>{isSubmitting ? 'Submitting...' : 'Submit Payment Details'}</span>
                   {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
             </div>
           </form>
           )}

           <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold text-slate-700 flex flex-wrap gap-x-6 gap-y-2 relative z-10">
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400"/> Indian Bank, Avalahalli</span>
              <span className="flex items-center gap-1.5">A/C: <span className="font-mono text-emerald-700 text-sm tracking-wide bg-emerald-50 px-1 rounded border border-emerald-100">50495632400</span></span>
              <span className="flex items-center gap-1.5">IFSC: <span className="font-mono text-emerald-700 text-sm tracking-wide bg-emerald-50 px-1 rounded border border-emerald-100">IDIB000A682</span></span>
           </div>
        </section>
      ) : applicationState !== 'not_applied' ? (
        <section className="bg-white border border-indigo-100 p-6 sm:p-8 rounded-2xl shadow-soft relative overflow-hidden group">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-5 w-full md:w-auto flex-1">
              <h3 className="text-base font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2 border-b border-indigo-50 pb-3">
                <Receipt className="w-5 h-5 text-indigo-500" />
                Your Application Overview
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Student Name</p>
                   <p className="font-bold text-slate-800 truncate">{student.name || '-'}</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">USN</p>
                   <p className="font-bold text-slate-800 uppercase truncate">{student.usn || '-'}</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                   <p className="font-bold text-slate-800 truncate">{student.department || '-'}</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Contact</p>
                   <p className="font-bold text-slate-800 truncate">{student.phone || '-'}</p>
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              {applicationState === 'applied' && (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 animate-pulse shadow-sm">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  Application Under Review
                </span>
              )}
              {applicationState === 'paid' && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  Fully Confirmed Resident
                </span>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white border border-border p-6 sm:p-8 rounded-2xl shadow-soft flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-card transition-all">
          <div className="space-y-4 w-full md:w-auto">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
              Ready to Secure Your Accommodation?
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs font-bold text-slate-700">
              <span className="bg-blue-50 text-primary border border-blue-100 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" /> FCFS Allotment
              </span>
              <span className="bg-blue-50 text-primary border border-blue-100 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" /> Affiliated with BMSIT&M
              </span>
              <span className="bg-blue-50 text-primary border border-blue-100 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> Safe Environment
              </span>
              <span className="bg-blue-50 text-primary border border-blue-100 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Hygienic Accommodation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/apply')}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md group whitespace-nowrap"
              type="button"
            >
              <span>Apply to Join</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      )}

      {/* 4. ALTERNATING FEATURE SECTIONS (Matching Reference Images with Overlapping Images) */}
      <section className="space-y-16 py-4">
        {PG_FEATURE_SECTIONS.map((feature, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <div
              key={feature.id}
              className={`flex flex-col ${
                isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-10 lg:gap-14`}
            >
              {/* Text Side */}
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-650 leading-relaxed font-normal">
                  {feature.description}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate(feature.route)}
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-7 rounded-full text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 group"
                    type="button"
                  >
                    <span>See More</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Stacked Overlapping Image Side */}
              <div className="flex-1 w-full max-w-lg lg:max-w-none">
                <div className="relative w-full aspect-[4/3]">
                  {/* Main Background Image */}
                  <div className={`w-[85%] h-[82%] overflow-hidden rounded-2xl shadow-lg border border-slate-200 ${!isEven ? 'ml-auto' : ''}`}>
                    <img
                      src={feature.mainImage}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      style={feature.mainImageStyle}
                    />
                  </div>
                  {/* Overlapping Inset Secondary Image */}
                  <div className={`absolute bottom-0 ${isEven ? 'right-0' : 'left-0'} w-[58%] h-[58%] overflow-hidden rounded-2xl border-4 border-white shadow-2xl z-10`}>
                    <img
                      src={feature.subImage}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      style={feature.subImageStyle}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 5. CONTACT ADMINISTRATION SECTION */}
      <section className="bg-white border border-border p-6 sm:p-8 rounded-2xl shadow-soft space-y-6">
        <div>
          <h3 className="text-lg font-black text-text uppercase tracking-wider">Contact Administration</h3>
          <p className="text-xs text-text-muted mt-1 uppercase font-semibold">Get in touch with OM SAI PG management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm font-semibold text-text">
          
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-primary shrink-0 border border-slate-200">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">PG Authorities</h4>
              <p className="text-slate-800 font-bold mt-1">Mr. Raghu (Owner / Management)</p>
              <p className="text-text-muted text-[11px] font-medium mt-0.5">Ms. Harika (Hostel Warden)</p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-primary shrink-0 border border-slate-200">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Contact Numbers</h4>
              <p className="text-slate-800 font-bold mt-1">+91 88616 60259 (Mr. Raghu)</p>
              <p className="text-text-muted text-[11px] font-medium mt-0.5">+91 99163 77391 (Ms. Harika - Warden)</p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-primary shrink-0 border border-slate-200">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Official Email</h4>
              <p className="text-slate-800 font-bold mt-1">admissions@omsailodge.com</p>
              <p className="text-text-muted text-[11px] font-medium mt-0.5">support@omsailodge.com</p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. FIND US — Boys PG & Girls PG Locations Side by Side */}
      <section className="bg-white border border-border p-6 sm:p-8 rounded-2xl shadow-soft space-y-6">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">
            Our Locations
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
            Find Us / Our Locations
          </h2>
          <p className="text-xs text-text-muted mt-1 font-medium">Conveniently located within walking distance of BMSIT&M campus.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boys PG Map */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-primary border border-blue-200">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Boys PG</h4>
                <p className="text-[10px] text-text-muted font-semibold">Om Sai Luxury Boy PG Elite</p>
              </div>
            </div>
            <div className="w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-border shadow-inner relative">
              <iframe
                title="Boys PG Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.0!2d77.5645!3d13.1345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOm+sai+luxury+boy+pg+Elite!5e0!3m2!1sen!2sin!4v1720000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                className="-mt-14 h-[calc(100%+65px)] w-full"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <button
              onClick={() => window.open('https://maps.app.goo.gl/NL1b3J3YrqfUAZTg7', '_blank', 'noopener,noreferrer')}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm group"
              type="button"
            >
              <span>Open in Google Maps</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Girls PG Map */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 border border-pink-200">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Girls PG</h4>
                <p className="text-[10px] text-text-muted font-semibold">Om Sai Luxury Ladies PG</p>
              </div>
            </div>
            <div className="w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-border shadow-inner relative">
              <iframe
                title="Girls PG Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.0!2d77.564!3d13.134!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOm+sai+luxury+ladies+PG!5e0!3m2!1sen!2sin!4v1720000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                className="-mt-14 h-[calc(100%+65px)] w-full"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <button
              onClick={() => window.open('https://maps.app.goo.gl/NQ9do2pSTdSCysLU8', '_blank', 'noopener,noreferrer')}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm group"
              type="button"
            >
              <span>Open in Google Maps</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
