import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getCopy, getLocale } from '../i18n';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const copy = getCopy(language);
  const locale = getLocale(language);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/candidate/')) return copy.header.titles.candidateDetail;
    if (path === '/dashboard') return copy.header.titles.dashboard;
    if (path === '/analytics') return copy.header.titles.analytics;
    if (path === '/demographics') return copy.header.titles.demographics;
    if (path === '/insights') return copy.header.titles.insights;
    if (path === '/scoring') return copy.header.titles.scoring;
    if (path === '/calendar') return copy.header.titles.calendar;
    if (path === '/activity-log') return copy.header.titles.activityLog;
    if (path === '/questionnaires') return copy.header.titles.questionnaires;
    if (path === '/positions') return copy.header.titles.positions;
    return copy.header.titles.default;
  };

  return (
    <header className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-b border-indigo-100 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Page Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString(locale, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-full text-xs bg-indigo-600 text-white border border-indigo-500 inline-flex items-center gap-1.5 shadow-sm hover:bg-indigo-700 transition"
              aria-label={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
              title={language === 'pt' ? 'English' : 'Português'}
            >
              {language === 'pt' ? (<><span>EN</span><span>🇬🇧</span></>) : (<><span>PT</span><span>🇧🇷</span></>)}
            </button>
            {/* Notifications (placeholder for future) */}
            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors relative"
              title={copy.header.notifications}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Notification badge (example) */}
              {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
            </button>

            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{user.username}</p>
                  <p className="text-xs text-gray-500">{copy.header.role}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium flex items-center space-x-2 shadow-sm"
              title={copy.header.logout}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{copy.header.logout}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
