import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './App';
import { useAdmin } from './AdminContext';
import { 
  ArrowLeft, 
  Upload, 
  MapPin, 
  Calendar, 
  Users, 
  Type,
  FileText,
  Tag,
  CheckCircle,
  Loader,
  X
} from 'lucide-react';
import { useCloudinaryUpload } from './hooks/useCloudinaryUpload';

const AddFestivalPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    month: '',
    description: '',
    category: '',
    expectedAttendees: '',
    contactEmail: '',
    organizerName: '',
    website: '',
    imagePreviews: [],
    imageUrls: []
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const { uploadImage, uploading, error: uploadError } = useCloudinaryUpload();
  
  const { user } = useContext(AuthContext);
  const { submitFestivalForApproval } = useAdmin();
  const navigate = useNavigate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const categories = [
    { value: 'Religious', icon: '⛪' },
    { value: 'Cultural', icon: '🎨' },
    { value: 'Historical', icon: '🏛️' },
    { value: 'Nature', icon: '🌿' }
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files.length) {
      const fileArr = Array.from(files);
      setSelecting(true);
      const localPreviews = fileArr.map(f => URL.createObjectURL(f));
      setSelectedImages(fileArr);
      setFormData(prev => ({
        ...prev,
        imagePreviews: [...(prev.imagePreviews || []), ...localPreviews]
      }));
      setSelecting(false);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => {
      const newPreviews = [...prev.imagePreviews];
      newPreviews.splice(index, 1);
      return { ...prev, imagePreviews: newPreviews };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Upload all selected images first
      let uploadedImageUrls = [];
      
      if (selectedImages.length > 0) {
        // Upload images one by one
        for (const file of selectedImages) {
          try {
            const url = await uploadImage(file);
            if (url) {
              uploadedImageUrls.push(url);
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            // Continue with other images even if one fails
          }
        }
        
        // If no images were uploaded successfully and there are no previous URLs
        if (uploadedImageUrls.length === 0 && formData.imageUrls.length === 0) {
          alert('Failed to upload images. Please try again.');
          setLoading(false);
          return;
        }
        
        // Clear selected images after upload
        setSelectedImages([]);
      }
      
      // Combine with any existing image URLs
      const allImageUrls = [...formData.imageUrls, ...uploadedImageUrls];
      
      // 2. Prepare the festival submission
      const submission = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        month: formData.month,
        description: formData.description.trim(),
        category: formData.category,
        expectedAttendees: formData.expectedAttendees || '0',
        contactEmail: formData.contactEmail?.trim() || '',
        organizerName: formData.organizerName?.trim() || '',
        website: formData.website?.trim() || '',
        imagePreviews: allImageUrls,
        imageUrls: allImageUrls,
        submittedBy: user?.email || 'anonymous',
        submittedAt: new Date().toISOString()
      };
      
      console.log('[AddFestivalPage] Submitting for approval:', submission);
      
      try {
        const result = submitFestivalForApproval(submission);
        console.log('submitFestivalForApproval result:', result);
        
        // Verify the submission was added to localStorage
        const storedSubmissions = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
        console.log('Current pending submissions in localStorage:', storedSubmissions);
        
        // Update form data with the new image URLs
        setFormData(prev => ({
          ...prev,
          imageUrls: allImageUrls,
          imagePreviews: allImageUrls
        }));
        
        setSubmitted(true);
        alert('Festival submitted for approval successfully!');
      } catch (submitError) {
        console.error('Error in submitFestivalForApproval:', submitError);
        throw submitError;
      }
    } catch (err) {
      console.error('Submit failed:', err);
      alert(err?.message || String(err));
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to add a festival.</p>
          <button
            onClick={() => navigate('/signin')}
            className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all hover-scale"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce-gentle" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Festival Submitted!</h1>
          <p className="text-gray-600 mb-6 max-w-md">
            Thank you for submitting your festival! Our team will review it and add it to the platform soon.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all hover-scale"
            >
              Back to Home
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '', location: '', month: '', description: '', category: '',
                  expectedAttendees: '', contactEmail: '', organizerName: '', website: '', image: null
                });
              }}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all hover-scale"
            >
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all hover-scale mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Festival</h1>
            <p className="text-gray-600">Share your festival with the Camarines Sur community</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Type className="w-5 h-5 mr-2 text-pink-500" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Festival Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="e.g. Tinagba Festival"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                      placeholder="e.g. Iriga City, Camarines Sur"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category and Timing */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-pink-500" />
                Category & Timing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map(category => (
                      <label
                        key={category.value}
                        className={`
                          flex items-center p-3 border rounded-lg cursor-pointer transition-all hover-scale
                          ${formData.category === category.value 
                            ? 'border-pink-500 bg-pink-50 text-pink-700' 
                            : 'border-gray-300 hover:border-gray-400'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span className="mr-2">{category.icon}</span>
                        <span className="text-sm font-medium">{category.value}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="month"
                      value={formData.month}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                      required
                    >
                      <option value="">Select Month</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-pink-500" />
                Description
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Festival Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  placeholder="Describe your festival, its history, activities, and what makes it special..."
                  required
                />
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-pink-500" />
                Additional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Attendees</label>
                  <input
                    type="number"
                    name="expectedAttendees"
                    value={formData.expectedAttendees}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="e.g. 5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organizer Name</label>
                  <input
                    type="text"
                    name="organizerName"
                    value={formData.organizerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="Your name or organization"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="https://festival-website.com"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-pink-500" />
                Festival Image
              </h2>
              {uploadError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  Upload error: {uploadError}
                </div>
              )}
              {(uploading || selecting) && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-blue-700 text-sm">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    {`Preparing ${selectedImages.length || ''} image(s)...`}
                  </div>
                </div>
              )}
              {formData.imagePreviews && formData.imagePreviews.length > 0 ? (
                <div className="relative">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img src={src} alt={`Preview ${idx+1}`} className="w-full h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-pink-600 hover:text-pink-700 font-medium">Upload an image</span>
                    <span className="text-gray-500"> or drag and drop</span>
                    <input
                      type="file"
                      name="image"
                      onChange={handleInputChange}
                      accept="image/*"
                      multiple
                      className="sr-only"
                    />
                  </label>
                  <p className="text-gray-400 text-sm mt-2">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all hover-scale"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all hover-scale font-medium flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : uploading ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Uploading Images...
                  </>
                ) : 'Submit Festival'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFestivalPage;