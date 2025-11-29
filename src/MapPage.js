import React, { useState } from 'react';
import { festivals } from './festival';
import { MapPin, Calendar, Star, Filter, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const MapPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFestivals = festivals.filter(festival => {
    const matchesCategory = selectedCategory === 'All' || festival.category === selectedCategory;
    const matchesMonth = selectedMonth === 'All' || festival.month === selectedMonth;
    const matchesSearch = festival.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         festival.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesMonth && matchesSearch;
  });

  const categoryIcons = {
    Religious: '⛪',
    Cultural: '🎨',
    Historical: '🏛️',
    Nature: '🌿',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center mb-6">
            <MapPin className="w-8 h-8 text-pink-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Festival Map</h1>
              <p className="text-gray-600">Discover festivals across Camarines Sur</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-pink-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Festivals</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search festivals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="All">All Categories</option>
                <option value="Religious">Religious</option>
                <option value="Cultural">Cultural</option>
                <option value="Historical">Historical</option>
                <option value="Nature">Nature</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="All">All Months</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="December">December</option>
              </select>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Map Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              We're working on an interactive map to show festival locations across Camarines Sur.
            </p>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="text-4xl mb-4">🗺️</div>
              <p className="text-gray-500">Map integration in development</p>
            </div>
          </div>
        </div>

        {/* Festival List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Festivals in Camarines Sur ({filteredFestivals.length})
          </h2>
          
          {filteredFestivals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFestivals.map((festival, index) => (
                <div
                  key={festival.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{categoryIcons[festival.category]}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{festival.name}</h3>
                        <p className="text-sm text-gray-600">{festival.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">{festival.rating ?? 0}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-pink-500" />
                      <span>{festival.month} {festival.year}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-pink-500" />
                      <span>{festival.expectedAttendees?.toLocaleString() || 'TBA'} attendees</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {festival.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      {festival.category}
                    </span>
                    <Link
                      to={`/festival/${festival.id}`}
                      className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MapPin className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No festivals found</h3>
              <p className="text-gray-500">Try adjusting your filters to find more festivals.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
