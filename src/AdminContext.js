import React, { createContext, useContext, useState, useEffect } from 'react';
import { festivals as initialFestivals } from './festival';

const AdminContext = createContext();

// Super admin credentials are read from environment variables.
// Create a `.env.local` (not committed) or set env vars in your environment:
// REACT_APP_SUPERADMIN_USER and REACT_APP_SUPERADMIN_PASS
const SUPER_ADMIN_CREDENTIALS = {
  username: process.env.REACT_APP_SUPERADMIN_USER || 'superadmin',
  password: process.env.REACT_APP_SUPERADMIN_PASS || ''
};

export const AdminProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [festivals, setFestivals] = useState(initialFestivals);
  const [adminLoading, setAdminLoading] = useState(false);

  // Check if admin is logged in on app start
  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession === 'true') {
      setIsAdminLoggedIn(true);
    }

    // Load festivals from localStorage if available
    const savedFestivals = localStorage.getItem('festivals');
    if (savedFestivals) {
      try {
        setFestivals(JSON.parse(savedFestivals));
      } catch (error) {
        console.error('Error loading festivals from localStorage:', error);
      }
    }
  }, []);

  // Save festivals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('festivals', JSON.stringify(festivals));
  }, [festivals]);

  const adminLogin = async (username, password) => {
    setAdminLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // If credentials are not configured via env, block login and show helpful message.
    if (!SUPER_ADMIN_CREDENTIALS.password) {
      setAdminLoading(false);
      return { success: false, error: 'Super admin credentials not configured. See .env.example' };
    }

    if (username === SUPER_ADMIN_CREDENTIALS.username && password === SUPER_ADMIN_CREDENTIALS.password) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('adminSession', 'true');
      setAdminLoading(false);
      return { success: true };
    } else {
      setAdminLoading(false);
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('adminSession');
  };

  const addFestival = (festivalData) => {
    const newFestival = {
      ...festivalData,
      id: generateFestivalId(festivalData.name),
      year: new Date().getFullYear(),
      rating: 0,
      expectedAttendees: parseInt(festivalData.expectedAttendees) || 0,
      imageUrls: Array.isArray(festivalData.imagePreviews) && festivalData.imagePreviews.length > 0
        ? [...festivalData.imagePreviews]
        : (festivalData.imagePreview ? [festivalData.imagePreview] : [])
    };

    setFestivals(prev => [...prev, newFestival]);
    return newFestival;
  };

  const updateFestival = (festivalId, updatedData) => {
    setFestivals(prev =>
      prev.map(festival =>
        festival.id === festivalId
          ? {
              ...festival,
              ...updatedData,
              imageUrls:
                updatedData.imagePreviews !== undefined
                  ? [...updatedData.imagePreviews]
                  : (updatedData.imagePreview !== undefined
                      ? (updatedData.imagePreview ? [updatedData.imagePreview] : festival.imageUrls || [])
                      : (festival.imageUrls || []))
            }
          : festival
      )
    );
  };

  const deleteFestival = (festivalId) => {
    setFestivals(prev => prev.filter(festival => festival.id !== festivalId));
  };

  const getFestivalById = (id) => {
    return festivals.find(festival => festival.id === id);
  };

  // Helper function to generate festival ID from name
  const generateFestivalId = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const value = {
    // Admin Auth
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    adminLoading,

    // Festival Management
    festivals,
    addFestival,
    updateFestival,
    deleteFestival,
    getFestivalById,

    // Note: credentials are read from env vars; do not expose secrets here
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};