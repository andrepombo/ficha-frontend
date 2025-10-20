import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="bg-white rounded-lg p-2">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ficha</h1>
              <p className="text-sm opacity-90">Painel do Empregador</p>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors font-medium"
            >
              Painel
            </Link>
            <Link
              to="/analytics"
              className="px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors font-medium"
            >
              Análise
            </Link>
            <Link
              to="/demographics"
              className="px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors font-medium"
            >
              Demografia
            </Link>
            <Link
              to="/insights"
              className="px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors font-medium"
            >
              Insights
            </Link>
            <Link
              to="/calendar"
              className="px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors font-medium"
            >
              📅 Calendário
            </Link>
            <a
              href="http://localhost:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
            >
              Admin Django
            </a>
            
            {/* User Info & Logout */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white border-opacity-30">
              {user && (
                <div className="text-sm">
                  <p className="font-medium">{user.username}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors font-medium flex items-center space-x-2"
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sair</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
