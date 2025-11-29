import React, { useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import HomePage from './HomePage';
import FestivalDetailPage from './FestivalDetailPage';
import AboutPage from './AboutPage';
import SignInPage from './SignInPage';
import SignUpPage from './SignUpPage';
import AddFestivalPage from './AddFestivalPage';
import FavoritesPage from './FavoritesPage';
import MapPage from './MapPage';
import SuperAdminLogin from './SuperAdminLogin';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminAddFestival from './AdminAddFestival';
import AdminEditFestival from './AdminEditFestival';
import { AdminProvider } from './AdminContext';


export const AuthContext = createContext();
export const FavoritesContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [favoritesLastSeenCount, setFavoritesLastSeenCount] = useState(0);

  const handleFavorite = (festivalId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(festivalId)) {
        newFavorites.delete(festivalId);
      } else {
        newFavorites.add(festivalId);
      }
      // Save to localStorage
      localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  // Load favorites from localStorage on app start
  React.useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    const savedLastSeen = localStorage.getItem('favorites_last_seen_count');
    if (savedLastSeen !== null) {
      const n = parseInt(savedLastSeen, 10);
      if (!Number.isNaN(n)) setFavoritesLastSeenCount(n);
    }
  }, []);

  const markFavoritesSeen = React.useCallback(() => {
    const countNow = favorites.size;
    setFavoritesLastSeenCount(countNow);
    localStorage.setItem('favorites_last_seen_count', String(countNow));
  }, [favorites]);

  const unreadFavoritesCount = Math.max(favorites.size - favoritesLastSeenCount, 0);

  return (
    <AdminProvider>
      <AuthContext.Provider value={{ user, setUser }}>
        <FavoritesContext.Provider value={{ favorites, handleFavorite, markFavoritesSeen, unreadFavoritesCount }}>
          <Router>
            <div className="min-h-screen bg-white">
              <Header />
              <main className="animate-fade-in">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/festival/:id" element={<FestivalDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/signin" element={<SignInPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/add-festival" element={<AddFestivalPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/map" element={<MapPage />} />
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<SuperAdminLogin />} />
                  <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
                  <Route path="/admin/add-festival" element={<AdminAddFestival />} />
                  <Route path="/admin/edit-festival/:id" element={<AdminEditFestival />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </FavoritesContext.Provider>
      </AuthContext.Provider>
    </AdminProvider>
  );
}

export default App;