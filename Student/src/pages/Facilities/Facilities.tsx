import React, { useState, useEffect } from 'react';
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
  ArrowUpDownIcon,
  Star,
  X,
  Loader2
} from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

// Icon map — matched by facility title (case-insensitive keyword)
const ICON_MAP: { keywords: string[]; icon: React.ElementType }[] = [
  { keywords: ['wi-fi', 'wifi', 'internet', 'broadband'],  icon: Wifi },
  { keywords: ['laundry', 'washing', 'wash'],               icon: WashingMachine },
  { keywords: ['ro', 'water', 'purif'],                     icon: LucideFilter },
  { keywords: ['power', 'generator', 'backup', 'electric'], icon: Power },
  { keywords: ['biometric', 'fingerprint', 'security'],     icon: LucideCylinder },
  { keywords: ['cctv', 'camera', 'surveillance'],           icon: CctvIcon },
  { keywords: ['parking', 'bike', 'two-wheeler', 'shoe'],   icon: SportShoe },
  { keywords: ['housekeep', 'cleaning', 'sweep', 'clean'],  icon: BrushCleaningIcon },
  { keywords: ['game', 'indoor', 'recreation', 'sport'],    icon: FireExtinguisher },
  { keywords: ['study', 'quiet', 'cabin', 'library'],       icon: ShirtIcon },
  { keywords: ['hot water', 'geyser', 'shower', 'bath'],    icon: BathIcon },
  { keywords: ['lift', 'elevator', 'elevator'],              icon: ArrowUpDownIcon },
];

function getIcon(title: string): React.ElementType {
  const lower = title.toLowerCase();
  for (const entry of ICON_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.icon;
    }
  }
  return Star; // default icon for admin-added facilities
}

function resolveImageUrl(imageUrl: string | null): string {
  if (!imageUrl) return '';
  // If it's already an absolute URL, use as-is
  if (imageUrl.startsWith('http')) return imageUrl;
  // If it's a relative path starting with /facilities/ — it's a local public asset
  if (imageUrl.startsWith('/facilities/')) return imageUrl;
  // Otherwise it's a backend upload path
  return `${API_BASE_URL}${imageUrl}`;
}

interface Facility {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
}

export const Facilities: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/facilities`)
      .then(res => res.json())
      .then(data => {
        setFacilities(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : facilities.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-text-muted font-semibold">
            No facilities available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {facilities.map(facility => {
              const Icon = getIcon(facility.title);
              const imgSrc = resolveImageUrl(facility.imageUrl);

              return (
                <div 
                  key={facility.id}
                  onClick={() => imgSrc && setSelectedImage(imgSrc)}
                  className="relative aspect-[3.2/3.3] rounded-2xl overflow-hidden shadow-soft border border-border group cursor-pointer"
                >
                  {/* Image */}
                  {imgSrc ? (
                    <img 
                      src={imgSrc}
                      alt={facility.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <Icon className="w-12 h-12 text-slate-300" />
                    </div>
                  )}

                  {/* Icon badge top-right */}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-primary shadow-sm z-10">
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col justify-end p-5 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0">
                    <div className="text-white space-y-1">
                      <h4 className="text-sm font-black tracking-wide uppercase text-primary-light">
                        {facility.title}
                      </h4>
                      <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                        {facility.description}
                      </p>
                      {imgSrc && (
                        <span className="text-[10px] text-slate-400 font-bold block pt-1.5 uppercase tracking-wider">
                          Click to view full image &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-slate-900/15 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 no-print"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center">
            <div className="relative inline-block overflow-hidden rounded-2xl border border-slate-200/80 shadow-2xl bg-white/60 backdrop-blur-md">
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50 border border-slate-200"
                aria-label="Close"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
              <img 
                src={selectedImage}
                alt="Facility View" 
                className="max-w-full max-h-[78vh] object-contain rounded-2xl block"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
