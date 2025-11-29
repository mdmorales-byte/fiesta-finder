import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import { useCloudinaryUpload } from './hooks/useCloudinaryUpload';
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
  Shield,
  X,
  Loader
} from 'lucide-react';

const AdminAddFestival = () => {
  const { uploadMultiple, uploading: uploadingImages, error: uploadError } = useCloudinaryUpload();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    month: '',
    description: '',
    category: '',
    expectedAttendees: '',
    imagePreviews: []
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadCount, setUploadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { addFestival, isAdminLoggedIn } = useAdmin();
  const navigate = useNavigate();

  // Redirect if not admin
  if (!isAdminLoggedIn) {
    navigate('/admin/login');
    return null;
  }

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
      setSelectedImages(fileArr);
      // Create local object URL previews for immediate display
      const localPreviews = fileArr.map(f => URL.createObjectURL(f));
      setFormData(prev => ({
        ...prev,
        imagePreviews: [...(prev.imagePreviews || []), ...localPreviews]
      }));
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
      let imageUrls = [...formData.imagePreviews];

      // Upload new images if selected
      if (selectedImages.length > 0) {
        // Copy selection locally and clear immediately so UI banner does not stick
        const filesToUpload = [...selectedImages];
        setUploadCount(filesToUpload.length);
        setSelectedImages([]);
        console.log('Starting upload of', selectedImages.length, 'images');
        console.log('Selected images:', selectedImages.map(f => ({ name: f.name, size: f.size, type: f.type })));
        const uploadedUrls = await uploadMultiple(filesToUpload);
        console.log('Uploaded URLs returned:', uploadedUrls);
        
        if (!uploadedUrls || uploadedUrls.length === 0) {
          console.error('No URLs returned from upload. Check Cloudinary upload hook error state:', uploadError);
          // Surface error and clear selection so the banner doesn't stay stuck
          if (uploadError) {
            alert('Upload failed: ' + uploadError);
          } else {
            alert('Upload failed. Please check your Cloudinary settings and try again.');
          }
          setSelectedImages([]);
          setUploadCount(0);
          setLoading(false);
          return;
        }
        // If some images failed, stop and ask the user to retry for reliability
        if (uploadedUrls.length !== filesToUpload.length) {
          alert(`Only ${uploadedUrls.length} of ${filesToUpload.length} images uploaded successfully. Please try again.`);
          setUploadCount(0);
          setLoading(false);
          return;
        }

        imageUrls = [...imageUrls, ...uploadedUrls.filter(url => url !== null)];
        console.log('Final image URLs to save:', imageUrls);
        setSelectedImages([]);
        setUploadCount(0);
      }

      // Remove temporary blob previews before saving (preserve order and duplicates intentionally)
      imageUrls = imageUrls.filter(u => typeof u === 'string' && !u.startsWith('blob:'));

      if (imageUrls.length === 0) {
        alert('Please add at least one image');
        setLoading(false);
        return;
      }

      console.log('Creating festival with', imageUrls.length, 'images');

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add festival using admin context
      const newFestival = addFestival({ ...formData, imagePreviews: imageUrls });
      console.log('Added festival to context:', newFestival);
      console.log('Festival imageUrls:', newFestival.imageUrls);

      setSubmitted(true);
      setLoading(false);
    } catch (error) {
      console.error('Error adding festival:', error);
      alert('Error: ' + error.message);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce-gentle" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Festival Added Successfully!</h1>
          <p className="text-gray-600 mb-6 max-w-md">
            The festival has been added to the platform and is now visible to all users.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '', location: '', month: '', description: '', category: '',
                  expectedAttendees: '', image: null, imagePreview: null
                });
              }}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all"
            >
              Add Another Festival
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
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Festival</h1>
              <p className="text-gray-600">Add a festival to the Camarines Sur collection</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Type className="w-5 h-5 mr-2 text-red-500" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      placeholder="e.g. Iriga City, Camarines Sur"
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Upload className="w-4 h-4 mr-2 text-gray-500" />
                      Add more images
                      <input
                        type="file"
                        name="image"
                        onChange={handleInputChange}
                        accept="image/*"
                        multiple
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Category and Timing */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-red-500" />
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
                          flex items-center p-3 border rounded-lg cursor-pointer transition-all
                          ${formData.category === category.value
                            ? 'border-red-500 bg-red-50 text-red-700'
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
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
                <FileText className="w-5 h-5 mr-2 text-red-500" />
                Description
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Festival Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="Describe the festival, its history, activities, and what makes it special..."
                  required
                />
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-red-500" />
                Additional Details
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Attendees</label>
                <input
                  type="number"
                  name="expectedAttendees"
                  value={formData.expectedAttendees}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="e.g. 5000"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-red-500" />
                Festival Image
              </h2>

              {uploadError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  Upload error: {uploadError}
                </div>
              )}

              {uploadingImages && uploadCount > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-blue-700 text-sm">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    {`Uploading ${uploadCount} image(s)...`}
                  </div>
                </div>
              )}

              {formData.imagePreviews && formData.imagePreviews.length > 0 ? (
                <div className="relative">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img src={src} alt={`Festival preview ${idx+1}`} className="w-full h-32 object-cover rounded-lg" />
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-red-600 hover:text-red-700 font-medium">Upload images</span>
                    <span className="text-gray-500"> or drag and drop</span>
                    <input
                      type="file"
                      name="image"
                      onChange={handleInputChange}
                      accept="image/*"
                      multiple
                      disabled={uploadingImages || loading}
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
                onClick={() => navigate('/admin/dashboard')}
                disabled={loading || uploadingImages}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImages || selectedImages.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Festival...
                  </>
                ) : uploadingImages ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Uploading Images...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Add Festival
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddFestival;