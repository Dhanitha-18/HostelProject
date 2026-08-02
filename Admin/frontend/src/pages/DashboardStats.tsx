import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ClipboardList, BedDouble, Users, User, UserCheck, Building, Wallet, BadgeCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchInterval: 3000
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-indigo-500/30 animate-pulse"></div>
          <Loader2 className="relative w-12 h-12 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="p-4 bg-red-100 text-red-600 rounded-2xl shadow-sm border border-red-200">
          <Activity className="w-8 h-8" />
        </div>
        <div className="text-red-500 font-bold text-lg">Failed to load dashboard statistics</div>
      </div>
    );
  }

  const { applications, beds, maleOccupancy, femaleOccupancy } = stats;

  const totalOccupancy = maleOccupancy + femaleOccupancy;
  const malePercent = totalOccupancy === 0 ? 0 : Math.round((maleOccupancy / totalOccupancy) * 100);
  const femalePercent = totalOccupancy === 0 ? 0 : Math.round((femaleOccupancy / totalOccupancy) * 100);
  
  const paymentPending = stats.payments?.pending || 0;
  const paymentCompleted = stats.payments?.completed || 0;

  const StatCard = ({ title, value, icon: Icon, delay, gradient, textColor, iconBg, href = "#" }: any) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
      >
        <Link to={href} className="block outline-none group">
          <Card className={`relative overflow-hidden bg-gradient-to-br ${gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-[1.5rem] hover:-translate-y-1`}>
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/20 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-500"></div>
            
            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${textColor} opacity-80 group-hover:opacity-100 transition-opacity`}>{title}</p>
                  <h3 className={`text-5xl font-black ${textColor} tracking-tight drop-shadow-sm`}>{value}</h3>
                </div>
                <div className={`p-4 rounded-2xl shadow-inner ${iconBg} ${textColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 backdrop-blur-sm border border-white/20`}>
                  <Icon className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header section */}
      <div className="relative">
        <div className="absolute -left-4 top-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 h-full rounded-r-lg"></div>
        <div className="pl-4">
          <h2 className="text-4xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            Dashboard Overview
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-lg">Real-time metrics and hostel analytics</p>
        </div>
      </div>
      
      {/* Group 1: Admin Actions */}
      <div>
        <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-400" /> Actions & Finance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="App Pending" 
            value={applications.pending} 
            icon={ClipboardList} 
            delay={0.1} 
            href="/applications" 
            gradient="from-amber-400 to-orange-500" 
            textColor="text-white"
            iconBg="bg-white/20"
          />
          <StatCard 
            title="Payment Pending" 
            value={paymentPending} 
            icon={Wallet} 
            delay={0.2} 
            href="/payments" 
            gradient="from-rose-400 to-red-500" 
            textColor="text-white"
            iconBg="bg-white/20"
          />
          <StatCard 
            title="Payment Completed" 
            value={paymentCompleted} 
            icon={BadgeCheck} 
            delay={0.3} 
            href="/payments" 
            gradient="from-emerald-400 to-teal-500" 
            textColor="text-white"
            iconBg="bg-white/20"
          />
        </div>
      </div>

      {/* Group 2: Hostel Resources */}
      <div>
        <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mt-8 mb-5 flex items-center gap-2">
          <Building className="w-5 h-5 text-indigo-400" /> Resources & Capacity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Avail Beds" 
            value={beds.available} 
            icon={BedDouble} 
            delay={0.4} 
            href="/occupancy" 
            gradient="from-blue-500 to-indigo-600" 
            textColor="text-white"
            iconBg="bg-white/20"
          />
          <StatCard 
            title="Total Occupied" 
            value={beds.occupied} 
            icon={Users} 
            delay={0.5} 
            href="/occupancy" 
            gradient="from-violet-500 to-purple-600" 
            textColor="text-white"
            iconBg="bg-white/20"
          />
          <StatCard 
            title="Total Blocks" 
            value={stats.totalBlocks} 
            icon={Building} 
            delay={0.6} 
            href="/blocks" 
            gradient="from-slate-600 to-slate-800" 
            textColor="text-white"
            iconBg="bg-white/20"
          />
        </div>
      </div>

      <div className="mt-12">
        {/* Boys and Girls Section - Redesigned */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
            
            <h3 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center">
              <Users className="w-6 h-6 mr-3 text-indigo-600 p-1 bg-indigo-100 rounded-lg" />
              Hostel Demographics
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-3xl border border-blue-100 flex flex-col items-center justify-center text-center hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 group overflow-hidden z-10">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                <div className="w-20 h-20 bg-white text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-md border border-blue-50 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <User className="w-10 h-10" />
                </div>
                <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-2">Boys Occupancy</p>
                <h4 className="text-6xl font-black text-blue-950 my-2 tracking-tight drop-shadow-sm">{maleOccupancy}</h4>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-24 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${malePercent}%` }}></div>
                  </div>
                  <span className="text-blue-700 text-sm font-bold">
                    {malePercent}%
                  </span>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-3xl border border-rose-100 flex flex-col items-center justify-center text-center hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-2 transition-all duration-300 group overflow-hidden z-10">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors"></div>
                <div className="w-20 h-20 bg-white text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-md border border-rose-50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <UserCheck className="w-10 h-10" />
                </div>
                <p className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-2">Girls Occupancy</p>
                <h4 className="text-6xl font-black text-rose-950 my-2 tracking-tight drop-shadow-sm">{femaleOccupancy}</h4>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-24 bg-rose-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${femalePercent}%` }}></div>
                  </div>
                  <span className="text-rose-700 text-sm font-bold">
                    {femalePercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
