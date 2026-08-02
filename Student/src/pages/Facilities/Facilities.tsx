import React, { useState } from 'react';
import { HeroBanner } from '../../components/layout/HeroBanner';
import { FACILITIES_HERO_IMAGE } from '../../assets/heroBanners';
import { 
  Wifi, 
  WashingMachine,
  LucideFilter,
  Power,
  LucideCylinder,
  CctvIcon,
  SportShoe,
  BrushCleaningIcon,
  FireExtinguisher,
  ShirtIcon,
  BathIcon,
  ArrowUpDownIcon
} from 'lucide-react';

const PG_FACILITIES = [
  { 
    name: 'High-Speed Wi-Fi', 
    desc: 'Commercial gigabit bandwidth across all lounge and study areas.', 
    icon: Wifi,
    image: "/facilities/wifib.jpeg"
  },
  { 
    name: 'Laundry Services', 
    desc: 'Washing machines and professional dry cleaning schedules twice a week.', 
    icon: WashingMachine,
    image: "/facilities/washingmachine.jpeg"
  },
  { 
    name: 'RO Purified Water', 
    desc: 'Continuous RO water dispensers on every floor checked for TDS levels.', 
    icon: LucideFilter,
    image: "/facilities/rowater.jpeg"
  },
  { 
    name: 'Power Backup', 
    desc: 'Silent diesel generator backup ensuring 24/7 electricity coverage.', 
    icon: Power,
    image: "/facilities/power.jpeg"
  },
  { 
    name: 'Biometric Security', 
    desc: 'Secure biometric fingerprint access points on main entry gates.', 
    icon: LucideCylinder,
    image: "/facilities/tanker.jpeg"
  },
  { 
    name: 'CCTV Surveillance', 
    desc: '60+ CCTV high definition cameras covering lobbies, corridors, and perimeters.', 
    icon: CctvIcon,
    image: "/facilities/cctv.jpeg"
  },
  { 
    name: 'Two-Wheeler Parking', 
    desc: 'Dedicated basement parking spots with security guard patrols.', 
    icon: SportShoe,
    image: "/facilities/shoerack.jpeg"
  },
  { 
    name: 'Daily Housekeeping', 
    desc: 'Professional sweeping and garbage disposal in all rooms every morning.', 
    icon: BrushCleaningIcon,
    image: "/facilities/cleaning2.jpeg"
  },
  { 
    name: 'Indoor Games Arena', 
    desc: 'Table tennis, carrom boards, and chess in the recreation lounge.', 
    icon: FireExtinguisher,
    image: "/facilities/FireExtinguisher.jpeg"
  },
  { 
    name: 'Quiet Study Area', 
    desc: 'Separate soundproof cabins equipped with desk lights and ports.', 
    icon: ShirtIcon,
    image: "/facilities/dryarea.jpeg"
  },
  { 
    name: 'Hot Water Supply', 
    desc: 'Solar heaters backed by instant geysers in all restrooms.', 
    icon: BathIcon,
    image: "/facilities/tanker.jpeg"
  },
  { 
    name: 'Modern Lift Access', 
    desc: 'Reliable 8-passenger automatic elevator with ARD safety triggers.', 
    icon: ArrowUpDownIcon,
    image: "/facilities/lift.jpeg"
  }
];

export const Facilities: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <HeroBanner 
        image={FACILITIES_HERO_IMAGE}
        title="Hostel Facilities & Services"
        subtitle="Modern student living with premium off-campus PG convenience"
      />

      {/* Facilities Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black text-text uppercase tracking-wider">Explore Services</h3>
          <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed font-semibold">Premium services bundled in your hostel fee components.</p>
        </div>

        {/* 3 columns in a row to look big */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PG_FACILITIES.map(facility => (
            <div 
              key={facility.name} 
              onClick={() => setSelectedImages([facility.image])}
              className="relative aspect-[3.2/3.3] rounded-2xl overflow-hidden shadow-soft border border-border group cursor-pointer"
            >
              {/* Picture First */}
              <img 
                src={facility.image} 
                alt={facility.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Icon at top right */}
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-primary shadow-sm z-10">
                <facility.icon className="w-4 h-4 shrink-0" />
              </div>

              {/* Cursor Pop-up Overlay (name and description pop up on hover) */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col justify-end p-5 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0">
                <div className="text-white space-y-1">
                  <h4 className="text-sm font-black tracking-wide uppercase text-primary-light">
                    {facility.name}
                  </h4>
                  <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                    {facility.desc}
                  </p>
                  <span className="text-[10px] text-slate-400 font-bold block pt-1.5 uppercase tracking-wider">
                    Click to view full image &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Screen Lightbox Modal for Facility Images */}
      {selectedImages && (
        <div 
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 no-print"
          onClick={() => setSelectedImages(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center space-y-3">
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedImages(null); }}
              className="absolute -top-12 right-0 text-white hover:text-slate-350 text-xs font-bold uppercase tracking-widest flex items-center gap-1 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700"
              type="button"
            >
              Close [X]
            </button>
            <img 
              src={selectedImages[0]} 
              alt="Facility View" 
              className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-slate-850 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
