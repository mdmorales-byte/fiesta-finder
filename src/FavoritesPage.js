import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FavoritesContext } from './App';
import { useAdmin } from './AdminContext';
import FestivalCard from './FestivalCard';
import { Heart, ArrowRight } from 'lucide-react';

const FavoritesPage = () => {
  const { favorites, markFavoritesSeen } = useContext(FavoritesContext);
  const { festivals } = useAdmin();

  const favoriteFestivals = festivals.filter(festival => favorites.has(festival.id));

  // Clear unread favorites badge when the page is viewed
  useEffect(() => {
    markFavoritesSeen();
  }, [markFavoritesSeen]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-pink-500 mr-3 animate-pulse-slow" />
            <h1 className="text-4xl font-bold text-gray-900">My Favorite Festivals</h1>
          </div>
          <p className="text-xl text-gray-600">
            Your saved festivals from across Camarines Sur
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-pink-100 text-pink-800 rounded-full">
            <Heart className="w-4 h-4 mr-2" />
            {favorites.size} festival{favorites.size !== 1 ? 's' : ''} saved
          </div>
        </div>

        {/* Favorites Grid */}
        {favoriteFestivals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
            {favoriteFestivals.map((festival, index) => (
              <div key={festival.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                 <FestivalCard
                   festival={festival}
                 />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-gray-400 mb-6">
              <Heart className="w-16 h-16 mx-auto animate-bounce-gentle" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No favorites yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring festivals and save your favorites by clicking the heart icon on any festival card.
            </p>
            <Link
              to="/"
              className="inline-flex items-center bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all hover-scale font-medium"
            >
              Discover Festivals
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        {favoriteFestivals.length > 0 && (
          <div className="mt-16 text-center animate-slide-up">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover-glow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all hover-scale"
                >
                  <span className="mr-2">🔍</span>
                  Discover More
                </Link>
                <Link
                  to="/map"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all hover-scale"
                >
                  <span className="mr-2">🗺️</span>
                  View on Map
                </Link>
                <button
                  onClick={() => {
                    const text = favoriteFestivals.map(f => `${f.name} - ${f.location}`).join('\n');
                    navigator.clipboard.writeText(text);
                    alert('Festival list copied to clipboard!');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all hover-scale"
                >
                  <span className="mr-2">📋</span>
                  Copy List
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories Breakdown */}
        {favoriteFestivals.length > 0 && (
          <div className="mt-12 animate-slide-up">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Your Favorite Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Religious', 'Cultural', 'Historical', 'Nature'].map((category) => {
                const count = favoriteFestivals.filter(f => f.category === category).length;
                const icons = { Religious: '⛪', Cultural: '🎨', Historical: '🏛️', Nature: '🌿' };
                
                return (
                  <div key={category} className="bg-white p-4 rounded-lg text-center hover-lift">
                    <div className="text-2xl mb-2">{icons[category]}</div>
                    <div className="text-sm font-medium text-gray-900">{category}</div>
                    <div className="text-lg font-bold text-pink-600">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;