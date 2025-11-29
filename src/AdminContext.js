import React, { createContext, useContext, useState, useEffect } from 'react';
import { festivals as initialFestivals } from './festival';

const AdminContext = createContext();

// Default super admin credentials (in production, this would be handled by a backend)
const SUPER_ADMIN_CREDENTIALS = {
  username: 'superadmin',
  password: 'fiesta2025!'
};

export const AdminProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [festivals, setFestivals] = useState(initialFestivals.map(f => ({ ...f, rating: 0 })));
  const [adminLoading, setAdminLoading] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);

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
        const parsed = JSON.parse(savedFestivals);
        setFestivals(Array.isArray(parsed) ? parsed.map(f => ({ ...f, rating: 0 })) : []);
      } catch (error) {
        console.error('Error loading festivals from localStorage:', error);
      }
    }

    // Load pending submissions
    const savedPending = localStorage.getItem('pendingSubmissions');
    if (savedPending) {
      try {
        setPendingSubmissions(JSON.parse(savedPending));
      } catch (error) {
        console.error('Error loading pending submissions:', error);
      }
    }
  }, []);

  // Save festivals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('festivals', JSON.stringify(festivals));
  }, [festivals]);

  useEffect(() => {
    localStorage.setItem('pendingSubmissions', JSON.stringify(pendingSubmissions));
  }, [pendingSubmissions]);

  const refreshPendingFromStorage = () => {
    try {
      const savedPending = localStorage.getItem('pendingSubmissions');
      if (savedPending) {
        const parsed = JSON.parse(savedPending);
        if (Array.isArray(parsed)) setPendingSubmissions(parsed);
      }
    } catch (e) {
      console.error('Failed to refresh pending submissions from storage', e);
    }
  };

  const adminLogin = async (username, password) => {
    setAdminLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

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
        : (festivalData.imagePreview ? [festivalData.imagePreview] : []),
      joinedUsers: []
    };

    setFestivals(prev => [...prev, newFestival]);
    return newFestival;
  };

  // Public user submits a festival for approval
  const submitFestivalForApproval = (submissionData) => {
    const pending = {
      ...submissionData,
      id: generateSubmissionId(submissionData.name + Date.now()), // Add timestamp to ensure unique ID
      status: 'pending',
      submittedAt: new Date().toISOString(),
      imagePreviews: submissionData.imagePreviews || submissionData.imageUrls || [],
      imageUrls: submissionData.imageUrls || submissionData.imagePreviews || [],
      submittedBy: submissionData.submittedBy || 'anonymous'
    };
    
    console.log('[AdminContext] Submitting for approval:', pending);
    
    // Get existing submissions from localStorage
    const existingSubmissions = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    const updatedSubmissions = [pending, ...existingSubmissions];
    
    // Update state and localStorage
    setPendingSubmissions(updatedSubmissions);
    localStorage.setItem('pendingSubmissions', JSON.stringify(updatedSubmissions));
    
    console.log('Updated pending submissions in localStorage:', updatedSubmissions);
    return pending;
  };
  
  

  // Super admin approves a pending submission
  const approveSubmission = (submissionId) => {
    console.log('[AdminContext] approveSubmission', submissionId);
    setPendingSubmissions(prev => {
      const sub = prev.find(p => p.id === submissionId);
      if (sub) {
        // Map pending fields to addFestival shape
        const festivalPayload = {
          ...sub,
          imagePreviews: sub.imageUrls && sub.imageUrls.length ? sub.imageUrls : sub.imagePreviews || []
        };
        console.log('[AdminContext] approving and publishing', festivalPayload);
        addFestival(festivalPayload);
      }
      return prev.filter(p => p.id !== submissionId);
    });
  };

  // Super admin rejects a pending submission
  const rejectSubmission = (submissionId) => {
    console.log('[AdminContext] rejectSubmission', submissionId);
    setPendingSubmissions(prev => prev.filter(p => p.id !== submissionId));
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

  const joinFestival = (festivalId, userId) => {
    setFestivals(prev =>
      prev.map(festival =>
        festival.id === festivalId
          ? {
              ...festival,
              joinedUsers: [
                ...(festival.joinedUsers || []),
                {
                  id: userId,
                  joinedAt: new Date().toISOString(),
                  rating: null
                }
              ]
            }
          : festival
      )
    );
  };

  const addUserRating = (festivalId, userId, ratingValue) => {
    setFestivals(prev =>
      prev.map(festival =>
        festival.id === festivalId
          ? {
              ...festival,
              joinedUsers: festival.joinedUsers.map(user =>
                user.id === userId ? { ...user, rating: ratingValue } : user
              ),
              rating: festival.joinedUsers.length > 0
                ? (festival.joinedUsers.reduce((sum, u) => sum + (u.rating || 0), 0) + ratingValue) / festival.joinedUsers.length
                : ratingValue
            }
          : festival
      )
    );
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

  const generateSubmissionId = (name) => {
    const base = generateFestivalId(name || 'festival');
    return `${base}-${Date.now()}`;
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
    joinFestival,
    addUserRating,

    // Approval workflow
    pendingSubmissions,
    submitFestivalForApproval,
    approveSubmission,
    rejectSubmission,
    refreshPendingFromStorage,

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