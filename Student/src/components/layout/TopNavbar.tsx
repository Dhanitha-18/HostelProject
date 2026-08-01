import { useState } from 'react';
import { Bell, Calendar, ChevronDown, User, LogOut, ShieldCheck, ExternalLink } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopNavbarProps {
  onMenuToggle: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuToggle }) => {
  const { student, notifications, markNotificationRead, markAllNotificationsRead } = usePayment();
  const { logout, isLoggedIn } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const ADMIN_PORTAL_URL = 'http://localhost:5173';

  const unreadNotifications = notifications.filter(n => !n.read);
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short',
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  const handleNotificationClick = (id: string) => {
    markNotificationRead(id);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-border h-16 fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm no-print">
      {/* Left side: Logo & Menu button */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-lg text-text-muted hover:bg-slate-100 hover:text-text focus:outline-none flex items-center justify-center transition-colors"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center">
          <div>
            <h1 className="text-sm sm:text-base font-bold text-primary tracking-tight leading-tight uppercase font-sans">
              OM SAI LUXURY PGS
            </h1>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
              Partnered with BMSIT&M
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Date, Admin Link, Student Login, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Date display (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 text-text-muted text-xs font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-border">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{today}</span>
        </div>

        {/* Admin Portal Link */}
        <a
          href={ADMIN_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[10px] py-1.5 px-3 rounded-lg border border-border transition-all uppercase tracking-wider cursor-pointer"
          title="Open Admin Portal"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Admin</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Student Login Button (Beside Admin) */}
        {!isLoggedIn ? (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all uppercase tracking-wider shadow-sm cursor-pointer"
            type="button"
            title="Student Login"
          >
            <User className="w-3.5 h-3.5" />
            <span>Student Login</span>
          </button>
        ) : null}

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-full text-text-muted hover:bg-slate-100 hover:text-text transition-colors relative focus:ring-2 focus:ring-primary/20 focus:outline-none"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 bg-danger text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center animate-pulse border-2 border-white">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-border rounded-xl shadow-card py-2 z-50 animate-fadeIn">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-border">
                <span className="text-xs font-bold text-text">Notifications ({unreadNotifications.length})</span>
                {unreadNotifications.length > 0 && (
                  <button 
                    onClick={markAllNotificationsRead}
                    className="text-[10px] text-primary hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-text-muted">No notifications</div>
                ) : (
                  notifications.slice(0, 5).map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id)}
                      className={`px-4 py-3 hover:bg-slate-50 border-b border-slate-100 cursor-pointer flex gap-3 transition-colors ${!notif.read ? 'bg-blue-50/40' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-primary' : 'bg-transparent'}`} />
                      <div className="flex-1">
                        <p className={`text-xs ${!notif.read ? 'font-semibold text-text' : 'text-text-muted'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[10px] text-text-muted line-clamp-1 mt-0.5">{notif.description}</p>
                        <span className="text-[9px] text-text-muted mt-1 block">{notif.date} • {notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 pt-2 text-center border-t border-border mt-1">
                <button 
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/notifications');
                  }}
                  className="text-xs text-primary hover:underline font-bold block w-full text-center"
                  type="button"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>        {/* Student Profile Dropdown (Only visible after login) */}
        {isLoggedIn ? (
          <div className="relative">
            <button 
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors text-left focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              {/* Profile Avatar */}
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold border border-primary/20 flex items-center justify-center text-sm shadow-inner uppercase shrink-0">
                {student.name ? student.name.charAt(0) : 'S'}
              </div>
              
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-text truncate max-w-[120px]">{student.name}</p>
                {student.usn && !student.usn.startsWith('APP-') && (
                  <p className="text-[9px] font-medium text-text-muted">{student.usn}</p>
                )}
              </div>
              
              <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-card py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-xs font-bold text-text">{student.name}</p>
                  {student.usn && !student.usn.startsWith('APP-') && (
                    <p className="text-[10px] text-text-muted font-mono">{student.usn}</p>
                  )}
                </div>
                
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-text hover:bg-slate-50 transition-colors w-full text-left font-bold"
                  type="button"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span>My Profile</span>
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-danger hover:bg-red-50 w-full text-left transition-colors border-t border-slate-100 font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
};
