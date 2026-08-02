import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../../components/layout/HeroBanner';
import { MESS_HERO_IMAGE } from '../../assets/heroBanners';
import { 
  Coffee, Sun, Clock, Moon, Star, ShoppingBag, 
  Utensils, CheckCircle2, Flame,
  Sandwich
} from 'lucide-react';

interface MealDetail {
  name: string;
  desc: string;
  img: string;
  time: string;
  calories: number;
  protein: string;
  rating: number;
  ratingCount: number;
  allergens: string[];
}

interface DayMenu {
  Breakfast: MealDetail;
  Lunch?: MealDetail;
  Snacks: MealDetail;
  Dinner: MealDetail;
}

const WEEKLY_MENU: Record<string, DayMenu> = {
  Monday: {
    Breakfast: {
      name: 'Idli, Vada, Sambar & Coconut Chutney (with Egg & Fruit)',
      desc: 'Steamed rice cakes, crispy vada, authentic sambar, coconut chutney served with boiled egg, banana & bread.',
      img: '/menu_photos/menu_photo_01.jpg',
      time: '7:30 AM - 9:00 AM',
      calories: 380,
      protein: '14g',
      rating: 4.8,
      ratingCount: 142,
      allergens: ['Coconut', 'Mustard', 'Egg']
    },
    Snacks: {
      name: 'Crispy Samosa / French Fries with Chutney',
      desc: 'Freshly fried potato samosa / peri peri fries served with sweet tomato sauce dip and hot Tea/Coffee/Milk.',
      img: '/menu_photos/menu_photo_02.jpg',
      time: '5:00 PM - 6:00 PM',
      calories: 310,
      protein: '5g',
      rating: 4.7,
      ratingCount: 98,
      allergens: ['Gluten']
    },
    Dinner: {
      name: 'Chole Masala, Vangi Bath, Roti, Rice & Payasam',
      desc: 'Rich chickpea masala gravy, aromatic eggplant rice bath, soft rotis, white rice, yellow dal, curd & vermicelli payasam.',
      img: '/menu_photos/menu_photo_03.jpg',
      time: '7:30 PM - 9:00 PM',
      calories: 620,
      protein: '18g',
      rating: 4.9,
      ratingCount: 175,
      allergens: ['Gluten', 'Dairy']
    }
  },
  Tuesday: {
    Breakfast: {
      name: 'Bisibele Bath, Upma & Boondi Khara (with Egg & Fruit)',
      desc: 'Hot lentil rice bisibele bath, vegetable semolina upma, spicy boondi khara, boiled egg, banana & bread slice.',
      img: '/menu_photos/menu_photo_04.jpg',
      time: '7:30 AM - 9:00 AM',
      calories: 410,
      protein: '13g',
      rating: 4.7,
      ratingCount: 128,
      allergens: ['Nuts', 'Gluten', 'Egg']
    },
    Snacks: {
      name: 'Hot Maggi Noodles with Sauce',
      desc: 'Freshly prepared masala noodles with veggies & herbs, served alongside hot Tea, Coffee, and Milk.',
      img: '/menu_photos/menu_photo_05.jpg',
      time: '5:00 PM - 6:00 PM',
      calories: 280,
      protein: '6g',
      rating: 4.9,
      ratingCount: 215,
      allergens: ['Gluten']
    },
    Dinner: {
      name: 'Aloo Capsicum, Egg Curry, Pudina Palav & Ice Cream',
      desc: 'Potato capsicum fry, rich egg curry (or paneer alternative), mint rice palav, rotis, curd & mini Kulfi / Cone ice cream.',
      img: '/menu_photos/menu_photo_06.jpg',
      time: '7:30 PM - 9:00 PM',
      calories: 690,
      protein: '24g',
      rating: 4.9,
      ratingCount: 230,
      allergens: ['Egg', 'Dairy']
    }
  },
  Wednesday: {
    Breakfast: {
      name: 'Set Dosa, Veg Sagu & Chutney',
      desc: 'Soft fluffy sponges of set dosa served with flavorful mixed vegetable sagu gravy and mint coconut chutney.',
      img: '/menu_photos/menu_photo_07.jpg',
      time: '7:30 AM - 9:00 AM',
      calories: 390,
      protein: '10g',
      rating: 4.8,
      ratingCount: 160,
      allergens: ['Coconut']
    },
    Snacks: {
      name: 'Pani Puri with Mashed Aloo & Tangy Water',
      desc: 'Street style crispy puris filled with spiced potato mash, sweet tamarind chutney, spicy mint water & boondi.',
      img: '/menu_photos/menu_photo_08.jpg',
      time: '5:00 PM - 6:00 PM',
      calories: 260,
      protein: '5g',
      rating: 4.9,
      ratingCount: 260,
      allergens: ['Gluten']
    },
    Dinner: {
      name: 'Chicken Chilly / Chicken Curry & Chilly Paneer with Ghee Rice',
      desc: 'Spicy chilly chicken gravy (or Chilly Paneer), fragrant Ghee Rice, rotis, salad, curd & pickle.',
      img: '/menu_photos/menu_photo_09.jpg',
      time: '7:30 PM - 9:00 PM',
      calories: 740,
      protein: '32g',
      rating: 4.9,
      ratingCount: 285,
      allergens: ['Dairy', 'Gluten']
    }
  },
  Thursday: {
    Breakfast: {
      name: 'Aloo Paratha with Curd & Chutney',
      desc: 'Pan-roasted wheat parathas filled with seasoned potatoes, served with fresh homemade curd and chutney.',
      img: '/menu_photos/menu_photo_10.jpg',
      time: '7:30 AM - 9:00 AM',
      calories: 460,
      protein: '13g',
      rating: 4.9,
      ratingCount: 195,
      allergens: ['Gluten', 'Dairy']
    },
    Snacks: {
      name: 'Mumbai Vadapav with Fried Chili',
      desc: 'Crispy spiced potato vada inside soft bun slider with dry garlic chutney, fried green chili and hot Tea/Coffee.',
      img: '/menu_photos/menu_photo_11.jpg',
      time: '5:00 PM - 6:00 PM',
      calories: 320,
      protein: '7g',
      rating: 4.8,
      ratingCount: 180,
      allergens: ['Gluten']
    },
    Dinner: {
      name: 'Cabbage Manchurian / Veg Kofta, Roti & Peas Pulav',
      desc: 'Indo-Chinese Manchurian or vegetable kofta gravy, fresh hot rotis, green peas pulav, curd & pickle.',
      img: '/menu_photos/menu_photo_12.jpg',
      time: '7:30 PM - 9:00 PM',
      calories: 630,
      protein: '16g',
      rating: 4.6,
      ratingCount: 135,
      allergens: ['Gluten', 'Dairy']
    }
  },
  Friday: {
    Breakfast: {
      name: 'Bread Omlette & Spiced Tomato Bath',
      desc: 'Fluffy double egg bread omlette (or veg toast) paired with tangy spiced Tomato Bath rice.',
      img: '/menu_photos/menu_photo_13.jpg',
      time: '7:30 AM - 9:00 AM',
      calories: 420,
      protein: '18g',
      rating: 4.8,
      ratingCount: 165,
      allergens: ['Egg', 'Gluten']
    },
    Snacks: {
      name: 'Crispy Onion Pakoda / Sweet Corn',
      desc: 'Golden crispy deep fried onion pakodas or warm buttered sweet corn cups with Tea, Coffee & Milk.',
      img: '/menu_photos/menu_photo_14.jpg',
      time: '5:00 PM - 6:00 PM',
      calories: 290,
      protein: '6g',
      rating: 4.7,
      ratingCount: 145,
      allergens: ['Gluten']
    },
    Dinner: {
      name: 'Bhindi Gravy, Ragi Mudde, Bassaru & Fruit Custard',
      desc: 'Traditional Karnataka Ragi Mudde with greens Bassaru broth, okra gravy, spinach palya and fruit custard.',
      img: '/menu_photos/menu_photo_15.jpg',
      time: '7:30 PM - 9:00 PM',
      calories: 670,
      protein: '19g',
      rating: 4.8,
      ratingCount: 190,
      allergens: ['Dairy']
    }
  },
  Saturday: {
    Breakfast: {
      name: 'Rava Idli & Poha Namkeen',
      desc: 'Steamed semolina rava idlis with cashews, savory flattened rice poha namkeen and coconut chutney.',
      img: '/menu_photos/menu_photo_16.jpg',
      time: '7:30 AM - 9:00 AM',
      calories: 370,
      protein: '10g',
      rating: 4.7,
      ratingCount: 130,
      allergens: ['Nuts', 'Gluten']
    },
    Lunch: {
      name: 'Mushroom Pulao, Paneer Butter Masala & Gulab Jamun',
      desc: 'Special weekend feast! Aromatic mushroom pulao with onion raitha, rich Paneer Butter Masala & hot Gulab Jamun.',
      img: '/menu_photos/menu_photo_17.jpg',
      time: '12:30 PM - 2:00 PM',
      calories: 760,
      protein: '23g',
      rating: 4.9,
      ratingCount: 240,
      allergens: ['Dairy', 'Gluten']
    },
    Snacks: {
      name: 'Cream Biscuits (Oreo/Bourbon) & Hot Tea/Coffee',
      desc: 'Assorted chocolate cream biscuits served with hot Tea, Coffee, and Milk.',
      img: '/menu_photos/menu_photo_18.jpg',
      time: '5:00 PM - 6:00 PM',
      calories: 250,
      protein: '4g',
      rating: 4.5,
      ratingCount: 110,
      allergens: ['Gluten', 'Dairy']
    },
    Dinner: {
      name: 'Puliyogare, Egg Burji, White Rice, Puri & Chole Dal',
      desc: 'Tamarind rice, fluffy puris with chole masala, spiced egg bhurji, white rice and yellow dal.',
      img: '/menu_photos/menu_photo_19.jpg',
      time: '7:30 PM - 9:00 PM',
      calories: 710,
      protein: '25g',
      rating: 4.8,
      ratingCount: 205,
      allergens: ['Egg', 'Gluten']
    }
  },
  Sunday: {
    Breakfast: {
      name: 'Masala Dosa, Shenga Chutney & Aloo Palya',
      desc: 'Crispy golden crepe filled with spiced potato palya, served with peanut chutney, coconut chutney and sambar.',
      img: '/menu_photos/menu_photo_20.jpg',
      time: '7:30 AM - 9:00 AM',
      calories: 440,
      protein: '12g',
      rating: 4.9,
      ratingCount: 270,
      allergens: ['Peanuts', 'Coconut']
    },
    Lunch: {
      name: 'Gobi Manchurian Dry & Cone Ice Cream',
      desc: 'Crispy cauliflower Manchurian dry starter served with special Sunday lunch thali and Cone Ice Cream.',
      img: '/menu_photos/menu_photo_21.jpg',
      time: '12:30 PM - 2:00 PM',
      calories: 680,
      protein: '17g',
      rating: 4.9,
      ratingCount: 250,
      allergens: ['Gluten', 'Dairy']
    },
    Snacks: {
      name: 'Fresh Seasonal Fruit Platter & Hot Tea',
      desc: 'Freshly sliced seasonal fruits (banana/apple/papaya) served with hot Tea, Coffee, and Milk.',
      img: '/menu_photos/menu_photo_22.jpg',
      time: '5:00 PM - 6:00 PM',
      calories: 210,
      protein: '3g',
      rating: 4.6,
      ratingCount: 95,
      allergens: []
    },
    Dinner: {
      name: 'Hyderabadi Chicken Biryani, Kebab & Paneer Gravy',
      desc: 'Grand Sunday Feast! Fragrant chicken biryani with chicken kebab (or Veg Biryani with Paneer gravy) & raitha.',
      img: '/menu_photos/menu_photo_23.jpg',
      time: '7:30 PM - 9:00 PM',
      calories: 850,
      protein: '38g',
      rating: 5.0,
      ratingCount: 320,
      allergens: ['Dairy', 'Gluten']
    }
  }
};

interface BookedGuestPass {
  id: string;
  mealType: string;
  count: number;
  amount: number;
  day: string;
  date: string;
  qrCode: string;
}

export const Mess: React.FC = () => {
  const [activeDay, setActiveDay] = useState<string>('Monday');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'nutrition'>('cards');

  // Interactive Guest Pass State
  const [showGuestPassModal, setShowGuestPassModal] = useState(false);
  const [showMyPassesModal, setShowMyPassesModal] = useState(false);
  const [guestMealType, setGuestMealType] = useState('Breakfast');
  const [guestCount, setGuestCount] = useState(1);
  const [passGenerated, setPassGenerated] = useState(false);
  const [currentGeneratedPass, setCurrentGeneratedPass] = useState<BookedGuestPass | null>(null);

  // Persistent Guest Passes List
  const [guestPassList, setGuestPassList] = useState<BookedGuestPass[]>(() => {
    try {
      const saved = localStorage.getItem('mess_guest_passes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Interactive Meal Rating & Feedback Modal
  const [ratingMeal, setRatingMeal] = useState<{ title: string; day: string } | null>(null);
  const [userStars, setUserStars] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Meal opt-out counter (Save Food) with persistence
  const [optedOutMeals, setOptedOutMeals] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mess_opted_out_meals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [rebatePoints, setRebatePoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mess_rebate_points');
      return saved ? JSON.parse(saved) : 240;
    } catch {
      return 240;
    }
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayMenu = WEEKLY_MENU[activeDay];

  useEffect(() => {
    try {
      localStorage.setItem('mess_opted_out_meals', JSON.stringify(optedOutMeals));
    } catch (e) {
      console.error(e);
    }
  }, [optedOutMeals]);

  useEffect(() => {
    try {
      localStorage.setItem('mess_rebate_points', JSON.stringify(rebatePoints));
    } catch (e) {
      console.error(e);
    }
  }, [rebatePoints]);

  useEffect(() => {
    try {
      localStorage.setItem('mess_guest_passes', JSON.stringify(guestPassList));
    } catch (e) {
      console.error(e);
    }
  }, [guestPassList]);

  const handleToggleOptOut = (mealKey: string) => {
    if (optedOutMeals.includes(mealKey)) {
      setOptedOutMeals(optedOutMeals.filter(m => m !== mealKey));
      setRebatePoints(prev => Math.max(0, prev - 20));
    } else {
      setOptedOutMeals([...optedOutMeals, mealKey]);
      setRebatePoints(prev => prev + 20);
    }
  };

  const handleCreateGuestPass = () => {
    const unitPrice = guestMealType === 'Breakfast' ? 60 : guestMealType === 'Snacks' ? 40 : 100;
    const total = unitPrice * guestCount;
    const passId = `GUEST-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPass: BookedGuestPass = {
      id: passId,
      mealType: guestMealType,
      count: guestCount,
      amount: total,
      day: activeDay,
      date: new Date().toISOString().split('T')[0],
      qrCode: passId
    };
    setCurrentGeneratedPass(newPass);
    setGuestPassList([newPass, ...guestPassList]);
    setPassGenerated(true);
  };

  const handleCancelGuestPass = (id: string) => {
    setGuestPassList(guestPassList.filter(p => p.id !== id));
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setRatingMeal(null);
      setUserComment('');
    }, 1500);
  };

  const calculateTotalNutrition = () => {
    const meals = [dayMenu.Breakfast, dayMenu.Lunch, dayMenu.Snacks, dayMenu.Dinner].filter((m): m is MealDetail => Boolean(m));
    const totalCal = meals.reduce((acc, m) => acc + m.calories, 0);
    const totalProt = meals.reduce((acc, m) => acc + parseInt(m.protein), 0);
    return { totalCal, totalProt };
  };

  const filterMatches = (name: string, desc: string) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesName = name.toLowerCase().includes(q);
      const matchesDesc = desc.toLowerCase().includes(q);
      if (!matchesName && !matchesDesc) return false;
    }
    return true;
  };

  const { totalCal, totalProt } = calculateTotalNutrition();

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <HeroBanner 
        image={MESS_HERO_IMAGE}
        title="Mess & Dining Portal"
        subtitle="Hygienic, nutritionally balanced food menu & guest dining management"
      />

      {/* Main Toolbar & View Controllers */}
      <div className="bg-white border border-border p-4 rounded-2xl shadow-soft space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Day Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {days.map(d => (
              <button
                key={d}
                onClick={() => { setActiveDay(d); setSearchTerm(''); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                  activeDay === d 
                    ? 'bg-primary text-white shadow-sm scale-[1.02]' 
                    : 'bg-slate-50 border border-border text-slate-700 hover:bg-slate-100'
                }`}
                type="button"
              >
                {d}
              </button>
            ))}
          </div>

          {/* Search bar inside toolbar */}
          <div className="relative w-full lg:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search dishes (e.g. Dosa, Biryani)..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-slate-800'
              }`}
            >
              Meal Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-slate-800'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setViewMode('nutrition')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'nutrition' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-slate-800'
              }`}
            >
              Nutrition Tracker
            </button>
          </div>

        </div>

        {/* Daily Summary Bar */}
        <div className="flex flex-wrap items-center justify-end border-t border-slate-100 pt-3 gap-2 text-xs font-semibold">
          <div className="text-[10px] text-text-muted font-bold flex items-center gap-3">
            <span>Daily Intake Est: <strong className="text-slate-800 font-mono text-xs">{totalCal} kcal</strong></span>
            <span>Est Protein: <strong className="text-primary font-mono text-xs">{totalProt}g</strong></span>
          </div>
        </div>

      </div>

      {/* VIEW MODE 1: Meal Cards */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-text uppercase tracking-wider">{activeDay}'s Menu Schedule</h3>
              <p className="text-[11px] text-text-muted mt-0.5 font-semibold">Prepared daily under strict sanitation standards.</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold border border-slate-200">
              Showing {activeDay}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Meal Items */}
            {([
              { key: 'Breakfast', icon: Coffee, data: dayMenu.Breakfast },
              ...(dayMenu.Lunch ? [{ key: 'Lunch', icon: Sun, data: dayMenu.Lunch }] : []),
              { key: 'Snacks', icon: Sandwich, data: dayMenu.Snacks },
              { key: 'Dinner', icon: Moon, data: dayMenu.Dinner },
            ] as const).map(({ key, icon: MealIcon, data }) => {
              const isFilteredOut = !filterMatches(data.name, data.desc);
              const optKey = `${activeDay}-${key}`;
              const isOptedOut = optedOutMeals.includes(optKey);

              if (isFilteredOut) return null;

              return (
                <div 
                  key={key}
                  className={`bg-white border border-border rounded-2xl overflow-hidden shadow-soft flex flex-col sm:flex-row hover:border-primary/40 transition-all ${
                    isOptedOut ? 'opacity-50 grayscale' : ''
                  }`}
                >
                  <div className="w-full sm:w-48 h-48 shrink-0 overflow-hidden relative group bg-slate-100">
                    <img src={data.img} alt={key} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <MealIcon className="w-3.5 h-3.5 text-warning" />
                      {key}
                    </div>

                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 px-2 py-0.5 rounded text-[9px] font-black tracking-wider flex items-center gap-1 shadow">
                      <Flame className="w-3 h-3 text-danger" />
                      {data.calories} kcal
                    </div>
                  </div>

                  <div className="p-5 flex flex-col justify-between flex-grow space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-snug">{data.name}</h4>
                      </div>

                      <p className="text-[11px] text-text-muted leading-relaxed font-semibold">{data.desc}</p>
                    </div>

                    {/* Allergens & Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[9.5px]">
                      <span className="font-bold text-text-muted">Contains:</span>
                      {data.allergens.map(alg => (
                        <span key={alg} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                          {alg}
                        </span>
                      ))}
                      <span className="ml-auto font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
                        Prot: {data.protein}
                      </span>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
                      <div className="flex items-center gap-1 text-[10px] text-text-muted font-bold">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{data.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRatingMeal({ title: data.name, day: activeDay })}
                          className="text-[10px] font-bold text-warning hover:text-warning/80 bg-warning/10 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Star className="w-3 h-3 fill-warning" />
                          <span>{data.rating}</span>
                          <span className="text-text-muted font-normal">({data.ratingCount})</span>
                        </button>

                        <button
                          onClick={() => handleToggleOptOut(optKey)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            isOptedOut 
                              ? 'bg-success text-white border-success' 
                              : 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100'
                          }`}
                        >
                          {isOptedOut ? 'Opted Out (+20 Pts)' : 'Skip Meal'}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

            {/* College Mess Lunch Banner for Mon-Fri */}
            {!dayMenu.Lunch && (
              <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-slate-100 border border-blue-200/80 rounded-2xl p-5 shadow-soft flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Monday to Friday Lunch Provision</h4>
                    <p className="text-[11px] text-slate-600 font-semibold mt-0.5">Provided directly in the main College Mess facility (Chapati, Rice, Sambar, Dal, Urid Pappad).</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary px-3 py-1 rounded-full border border-primary/20 shrink-0">
                  College Mess
                </span>
              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEW MODE 2: Weekly Schedule Table */}
      {viewMode === 'table' && (
        <div className="bg-white border border-border rounded-2xl p-6 shadow-soft overflow-x-auto">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-text uppercase tracking-wider">Full 7-Day BMSIT Mess Schedule Matrix</h3>
              <p className="text-[11px] text-text-muted mt-0.5 font-semibold">Overview of breakfast, lunch, tea snacks, and dinner across the week.</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              BMSIT Common Menu (A & B Block)
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[9.5px] tracking-wider">
                <th className="p-3.5 rounded-tl-xl">Day</th>
                <th className="p-3.5">Breakfast (7:30 AM)</th>
                <th className="p-3.5">Lunch (12:30 PM)</th>
                <th className="p-3.5">Snacks (5:00 PM)</th>
                <th className="p-3.5 rounded-tr-xl">Dinner (7:30 PM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-semibold text-slate-700">
              {days.map(d => {
                const menu = WEEKLY_MENU[d];
                const isSelected = activeDay === d;
                return (
                  <tr 
                    key={d} 
                    onClick={() => setActiveDay(d)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5 font-bold text-primary' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3.5 font-black text-slate-900 border-r border-border">{d}</td>
                    <td className="p-3.5 border-r border-border">
                      <div className="font-bold text-slate-800">{menu.Breakfast.name}</div>
                      <div className="text-[10px] text-text-muted font-normal mt-0.5">{menu.Breakfast.calories} kcal • {menu.Breakfast.protein}</div>
                    </td>
                    <td className="p-3.5 border-r border-border">
                      {menu.Lunch ? (
                        <>
                          <div className="font-bold text-slate-800">{menu.Lunch.name}</div>
                          <div className="text-[10px] text-text-muted font-normal mt-0.5">{menu.Lunch.calories} kcal • {menu.Lunch.protein}</div>
                        </>
                      ) : (
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md inline-block">
                          Provided in College Mess
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 border-r border-border">
                      <div className="font-bold text-slate-800">{menu.Snacks.name}</div>
                      <div className="text-[10px] text-text-muted font-normal mt-0.5">{menu.Snacks.calories} kcal • {menu.Snacks.protein}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{menu.Dinner.name}</div>
                      <div className="text-[10px] text-text-muted font-normal mt-0.5">{menu.Dinner.calories} kcal • {menu.Dinner.protein}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODE 3: Nutrition Tracker */}
      {viewMode === 'nutrition' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-border p-6 rounded-2xl shadow-soft space-y-6">
            <div>
              <h3 className="text-sm font-black text-text uppercase tracking-wider">{activeDay} Macro Breakdown</h3>
              <p className="text-[11px] text-text-muted mt-0.5 font-semibold">Nutritional profile calculated for official BMSIT hostel menu.</p>
            </div>

            {/* Macro Cards */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Calories</span>
                <span className="text-xl font-black text-slate-900 font-mono mt-1 block">{totalCal}</span>
                <span className="text-[10px] text-success font-bold mt-1 block">Within Daily Target</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Protein</span>
                <span className="text-xl font-black text-primary font-mono mt-1 block">{totalProt}g</span>
                <span className="text-[10px] text-text-muted font-bold mt-1 block">High Protein</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Carbs & Fats</span>
                <span className="text-xl font-black text-warning font-mono mt-1 block">140g / 32g</span>
                <span className="text-[10px] text-text-muted font-bold mt-1 block">Balanced Ratio</span>
              </div>
            </div>

            {/* Meal by meal progress */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Meal Nutrition Share</h4>
              {([
                { label: 'Breakfast', data: dayMenu.Breakfast, color: 'bg-amber-500' },
                ...(dayMenu.Lunch ? [{ label: 'Lunch', data: dayMenu.Lunch, color: 'bg-primary' }] : []),
                { label: 'Tea Snacks', data: dayMenu.Snacks, color: 'bg-emerald-500' },
                { label: 'Dinner', data: dayMenu.Dinner, color: 'bg-indigo-600' }
              ]).map(m => (
                <div key={m.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{m.label} ({m.data.name})</span>
                    <span className="font-mono text-text-muted">{m.data.calories} kcal ({m.data.protein} prot)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${m.color}`} 
                      style={{ width: `${Math.min(100, (m.data.calories / 850) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-soft space-y-4 h-fit">
            <h3 className="text-sm font-black text-text uppercase tracking-wider">Dietary Assistance</h3>
            <p className="text-[11px] text-text-muted leading-relaxed font-semibold">
              Special dietary requests can be coordinated directly with the Head Mess Warden.
            </p>
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-2 text-xs font-semibold">
              <span className="text-primary font-black uppercase text-[10px] tracking-wider block">Warden Helpline</span>
              <p className="text-slate-700">Mess Supervisor: BMSIT Mess Cell</p>
              <p className="text-slate-700">Timings: 8:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL BMSIT MESS DIRECTIVES & NOTES */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-black tracking-wide text-white uppercase">Official Mess Provisions & Daily Guidelines</h4>
              <p className="text-[11px] text-slate-400 font-medium">BMS Institute of Technology & Management — Common Menu for A & B Block</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
            WEF 2026 • Official Menu
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-200">
          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl space-y-2">
            <span className="text-blue-300 font-black uppercase text-[10px] tracking-wider block">📍 Campus Lunch & Grand Dinner Policy</span>
            <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc pl-4 leading-relaxed font-medium">
              <li><strong>Monday to Friday Lunch:</strong> Provided in the College Mess facility and for special campus events.</li>
              <li><strong>Grand Dinners:</strong> Special grand dinners provided in the hostel mess periodically.</li>
            </ul>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl space-y-2">
            <span className="text-amber-400 font-black uppercase text-[10px] tracking-wider block">🍦 Desserts & Supplier Note</span>
            <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc pl-4 leading-relaxed font-medium">
              <li><strong>Kulfi / Cone Ice Cream:</strong> Served according to availability from verified suppliers.</li>
              <li><strong>Tea / Coffee / Milk (TCM):</strong> Served fresh every evening during snacks slot.</li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl space-y-2 text-xs">
          <span className="text-emerald-400 font-black uppercase text-[10px] tracking-wider block">📋 Daily Meal Inclusions Chart</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-slate-300 font-medium">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <strong className="text-white block mb-1">🍳 Breakfast Includes:</strong>
              Bread, Jam, Butter, Egg (Except Sunday), Corn Flakes, Tea, Coffee, Milk, Fruit all days. Sprouts on alternate days.
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <strong className="text-white block mb-1">🍚 Lunch Includes:</strong>
              Chapati, Rice, Sambar, Dal (all days), Urid Pappad.
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <strong className="text-white block mb-1">☕ Snacks Includes:</strong>
              Tea, Coffee, and Milk (TCM) on all days.
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <strong className="text-white block mb-1">🍲 Dinner Includes:</strong>
              Chapati, Salad, Pickle, Curd, *Ghee all days, Rice, and Sambar (except on Saturday).
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Guest Meal Voucher Booking */}
      {showGuestPassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-slate-900">Guest Meal Pass Booking</h3>
                <p className="text-xs text-text-muted mt-0.5 font-semibold">Instant digital pass for parents & friends visiting mess</p>
              </div>
              <button 
                onClick={() => setShowGuestPassModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {!passGenerated ? (
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Select Meal Slot</label>
                  <select 
                    value={guestMealType}
                    onChange={e => setGuestMealType(e.target.value)}
                    className="w-full border border-border rounded-xl p-2.5 bg-white font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Breakfast">Breakfast (₹60)</option>
                    <option value="Lunch">Lunch Special (₹100)</option>
                    <option value="Snacks">Evening Snacks (₹40)</option>
                    <option value="Dinner">Dinner (₹100)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Number of Guests</label>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 font-black text-slate-700 flex items-center justify-center hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-black text-slate-900">{guestCount}</span>
                    <button 
                      onClick={() => setGuestCount(guestCount + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 font-black text-slate-700 flex items-center justify-center hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1 font-semibold text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Pass Amount:</span>
                    <span className="font-mono font-bold">₹{(guestMealType === 'Breakfast' ? 60 : guestMealType === 'Snacks' ? 40 : 100) * guestCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Date:</span>
                    <span className="font-bold">{activeDay} Menu</span>
                  </div>
                </div>

                <button
                  onClick={handleCreateGuestPass}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Generate QR Guest Pass</span>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto border border-success/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Guest Pass Generated!</h4>
                  <p className="text-xs text-text-muted mt-1 font-semibold">Scan this voucher at the mess entry coupon counter.</p>
                </div>
                
                {/* Simulated QR Code */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl w-48 h-48 mx-auto flex flex-col items-center justify-center space-y-2 border border-slate-800">
                  <div className="w-32 h-32 bg-white p-2 rounded-lg flex items-center justify-center text-slate-900 font-mono font-black text-[10.5px] text-center break-all">
                    {currentGeneratedPass?.id || 'GUEST-PASS'}
                  </div>
                  <span className="font-mono text-[9px] text-slate-400">VALID: {currentGeneratedPass?.day} ({currentGeneratedPass?.mealType})</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs text-left space-y-1">
                  <div><strong>Slot:</strong> {currentGeneratedPass?.mealType} ({currentGeneratedPass?.day})</div>
                  <div><strong>Count:</strong> {currentGeneratedPass?.count} Guest(s)</div>
                  <div><strong>Total Paid:</strong> ₹{currentGeneratedPass?.amount}</div>
                </div>

                <button
                  onClick={() => setShowGuestPassModal(false)}
                  className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-800 transition-colors"
                >
                  Close & Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: Meal Review / Rating */}
      {ratingMeal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-slate-900">Rate Meal: {ratingMeal.title}</h3>
                <p className="text-xs text-text-muted mt-0.5 font-semibold">Your rating helps chefs improve daily menu quality</p>
              </div>
              <button 
                onClick={() => setRatingMeal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Feedback Submitted!</h4>
                <p className="text-xs text-text-muted font-semibold">Thank you for rating today's meal.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRating} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5 text-center">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Your Star Rating</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserStars(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-7 h-7 ${star <= userStars ? 'fill-warning text-warning' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Comments / Suggestions</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Taste was great, but sambar was a little cold..."
                    value={userComment}
                    onChange={e => setUserComment(e.target.value)}
                    className="w-full border border-border rounded-xl p-3 font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl shadow transition-colors"
                >
                  Submit Meal Review
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL 3: My Booked Passes list */}
      {showMyPassesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-slate-900">My Booked Guest Passes</h3>
                <p className="text-xs text-text-muted mt-0.5 font-semibold">Active and past guest dining vouchers</p>
              </div>
              <button 
                onClick={() => setShowMyPassesModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {guestPassList.length === 0 ? (
                <div className="text-center py-8 text-xs text-text-muted font-bold">
                  No guest passes booked yet.
                </div>
              ) : (
                guestPassList.map(pass => (
                  <div key={pass.id} className="bg-slate-50 border border-border p-3.5 rounded-xl flex items-center justify-between text-xs font-semibold gap-3">
                    <div className="space-y-1 text-left">
                      <div className="font-black text-slate-900">{pass.mealType} Pass ({pass.count} guests)</div>
                      <div className="text-[10px] text-text-muted">
                        Day: {pass.day} • Date: {pass.date}
                      </div>
                      <div className="font-mono text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded w-fit">
                        {pass.id}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-800 font-mono">₹{pass.amount}</div>
                      <button
                        onClick={() => handleCancelGuestPass(pass.id)}
                        className="text-[10px] text-danger hover:underline mt-1 block font-black"
                      >
                        Cancel Pass
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowMyPassesModal(false)}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
