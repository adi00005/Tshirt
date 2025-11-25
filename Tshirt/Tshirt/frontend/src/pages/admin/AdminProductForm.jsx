import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminProductForm.css';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: 'unisex',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
    stock: '',
    images: [],
    tags: '',
    status: 'active',
    material: 'Cotton',
    fit: 'Regular',
    neckline: 'Crew Neck',
    sleeveLength: 'Short Sleeve'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:4999/api/admin/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      const product = data.data;
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        compareAtPrice: product.compareAtPrice || '',
        category: product.category || 'unisex',
        sizes: product.sizes || ['S', 'M', 'L', 'XL'],
        colors: product.colors || ['Black', 'White'],
        stock: product.stock || '',
        images: product.images || [],
        tags: product.tags?.join(', ') || '',
        status: product.status || 'active',
        material: product.material || 'Cotton',
        fit: product.fit || 'Regular',
        neckline: product.neckline || 'Crew Neck',
        sleeveLength: product.sleeveLength || 'Short Sleeve'
      });
      
      setImagePreview(product.images || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    if (index < formData.images.length) {
      // Remove from existing images
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      // Remove from new files
      const fileIndex = index - formData.images.length;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key === 'images') return; // Handle separately
        if (key === 'tags') {
          const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          submitData.append(key, JSON.stringify(tagsArray));
        } else if (Array.isArray(formData[key])) {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add existing images
      if (formData.images.length > 0) {
        submitData.append('existingImages', JSON.stringify(formData.images));
      }
      
      // Add new image files
      imageFiles.forEach(file => {
        submitData.append('images', file);
      });

      const url = isEdit 
        ? `http://localhost:4999/api/admin/products/${id}`
        : 'http://localhost:4999/api/admin/products';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEdit ? 'update' : 'create'} product`);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit && !formData.name) {
    return (
      <div className="admin-product-form">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-product-form">
      <div className="form-header">
        <button onClick={() => navigate('/admin/products')} className="back-btn">
          ← Back to Products
        </button>
        <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter product name"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Enter product description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Compare at Price</label>
                <input
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="kids">Kids</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="form-section">
            <h2>Product Details</h2>
            
            <div className="form-group">
              <label>Available Sizes</label>
              <input
                type="text"
                value={formData.sizes.join(', ')}
                onChange={(e) => handleArrayChange('sizes', e.target.value)}
                placeholder="S, M, L, XL, XXL"
              />
              <small>Separate sizes with commas</small>
            </div>

            <div className="form-group">
              <label>Available Colors</label>
              <input
                type="text"
                value={formData.colors.join(', ')}
                onChange={(e) => handleArrayChange('colors', e.target.value)}
                placeholder="Black, White, Red, Blue"
              />
              <small>Separate colors with commas</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Material</label>
                <select
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                >
                  <option value="Cotton">Cotton</option>
                  <option value="Polyester">Polyester</option>
                  <option value="Cotton Blend">Cotton Blend</option>
                  <option value="Organic Cotton">Organic Cotton</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fit</label>
                <select
                  name="fit"
                  value={formData.fit}
                  onChange={handleInputChange}
                >
                  <option value="Regular">Regular</option>
                  <option value="Slim">Slim</option>
                  <option value="Loose">Loose</option>
                  <option value="Oversized">Oversized</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Neckline</label>
                <select
                  name="neckline"
                  value={formData.neckline}
                  onChange={handleInputChange}
                >
                  <option value="Crew Neck">Crew Neck</option>
                  <option value="V-Neck">V-Neck</option>
                  <option value="Scoop Neck">Scoop Neck</option>
                  <option value="Round Neck">Round Neck</option>
                </select>
              </div>
              <div className="form-group">
                <label>Sleeve Length</label>
                <select
                  name="sleeveLength"
                  value={formData.sleeveLength}
                  onChange={handleInputChange}
                >
                  <option value="Short Sleeve">Short Sleeve</option>
                  <option value="Long Sleeve">Long Sleeve</option>
                  <option value="3/4 Sleeve">3/4 Sleeve</option>
                  <option value="Sleeveless">Sleeveless</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <h2>Product Images</h2>
            
            <div className="form-group">
              <label>Upload Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <small>Upload multiple images (JPG, PNG, WebP)</small>
            </div>

            {imagePreview.length > 0 && (
              <div className="image-preview-grid">
                {imagePreview.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img src={image} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO & Settings */}
          <div className="form-section">
            <h2>SEO & Settings</h2>
            
            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="casual, summer, trendy"
              />
              <small>Separate tags with commas</small>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
