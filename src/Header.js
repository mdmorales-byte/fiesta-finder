import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext, FavoritesContext } from './App';
import { Search, Heart, Info, User, Plus, LogOut } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const { unreadFavoritesCount } = useContext(FavoritesContext);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 hover-scale">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🏛️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fiesta Finder</h1>
              <p className="text-xs text-gray-500">Discover festivals in Camarines Sur, Philippines</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search festivals in Camarines Sur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              />
            </form>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-4">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-md flex items-center transition-all hover-scale ${
                location.pathname === '/' 
                  ? 'text-white bg-gradient-to-r from-pink-500 to-orange-500' 
                  : 'text-gray-700 hover:text-pink-600'
              }`}
            >
              <span className="mr-2">🏠</span>
              Home
            </Link>
            
            <Link 
              to="/favorites" 
              className={`px-4 py-2 rounded-md flex items-center transition-all hover-scale relative ${
                location.pathname === '/favorites' 
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-gray-700 hover:text-pink-600'
              }`}
            >
              <Heart className="w-4 h-4 mr-2" />
              Favorites
              {unreadFavoritesCount > 0 && location.pathname !== '/favorites' && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadFavoritesCount}
                </span>
              )}
            </Link>
            
            <Link 
              to="/about" 
              className={`px-4 py-2 rounded-md flex items-center transition-all hover-scale ${
                location.pathname === '/about' 
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-gray-700 hover:text-pink-600'
              }`}
            >
              <Info className="w-4 h-4 mr-2" />
              About
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md">
                  <span className="mr-2">{user.avatar}</span>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-700 hover:text-pink-600 transition-all hover-scale"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/signin" 
                className={`px-4 py-2 rounded-md flex items-center transition-all hover-scale ${
                  location.pathname === '/signin' 
                    ? 'text-pink-600 bg-pink-50' 
                    : 'text-gray-700 hover:text-pink-600'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            )}
            
            <Link 
              to="/add-festival" 
              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-4 py-2 rounded-md flex items-center transition-all hover-scale"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Festival
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;