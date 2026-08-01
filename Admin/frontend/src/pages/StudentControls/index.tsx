import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FacilitiesControl from './FacilitiesControl';
import FeedbackControl from './FeedbackControl';
import ComplaintsControl from './ComplaintsControl';
import SocialControl from './SocialControl';
import LeaveControl from './LeaveControl';
import MessMenuControl from './MessMenuControl';
import CircularsControl from './CircularsControl';
import { Building2, MessageSquare, AlertTriangle, Users, Calendar, Utensils, Bell } from 'lucide-react';

export default function StudentControlsIndex() {
  const [activeTab, setActiveTab] = useState('facilities');

  const tabs = [
    { id: 'facilities', label: 'Facilities', icon: Building2 },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
    { id: 'mess_menu', label: 'Mess Menu', icon: Utensils },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'social', label: 'Social Connect', icon: Users },
    { id: 'leaves', label: 'Leave Applications', icon: Calendar },
  ];

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Student Dashboard Control</h1>
        <p className="text-slate-500 mt-1">Manage data that reflects on the student portal.</p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'facilities' && <FacilitiesControl />}
            {activeTab === 'feedback' && <FeedbackControl />}
            { activeTab === 'complaints' && <ComplaintsControl /> }
            { activeTab === 'mess_menu' && <MessMenuControl /> }
            { activeTab === 'notifications' && <CircularsControl /> }
            { activeTab === 'social' && <SocialControl /> }
            { activeTab === 'leaves' && <LeaveControl /> }
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
