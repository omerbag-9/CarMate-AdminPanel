import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import cookies from 'js-cookie';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function AddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [subImagesPreview, setSubImagesPreview] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://fb-m90x.onrender.com/seller/getcategories');
        if (response.data && response.data.data) {
          // Ensure categories is always an array
          setCategories(Array.isArray(response.data.data.categories) ? response.data.data.categories : []);
          
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]); // Set to empty array on error
      }
    };

    fetchCategories();
  }, []);

  // Validation schema using Yup
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    slug: Yup.string()
      .required('Slug is required')
      .matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    productLink: Yup.string().url('Enter a valid URL'),
    price: Yup.number()
      .required('Price is required')
      .positive('Price must be positive')
      .typeError('Price must be a number'),
    description: Yup.string().required('Description is required'),
    categoryId: Yup.string().required('Category is required'),
  });

  // Initial form values
  const initialValues = {
    title: '',
    slug: '',
    productLink: '',
    price: '',
    description: '',
    categoryId: categories.length > 0 ? categories[0].id : '',
    mainImage: null,
    subImages: []
  };

  // Handle form submission
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate files
      if (!values.mainImage) {
        throw new Error('Main image is required');
      }

      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('slug', values.slug);
      formData.append('productLink', values.productLink);
      formData.append('price', values.price);
      formData.append('description', values.description);
      formData.append('categoryId', values.categoryId);
      formData.append('mainImage', values.mainImage);
      
      // Append sub images if any
      if (values.subImages) {
        for (let i = 0; i < values.subImages.length; i++) {
          formData.append('subImages', values.subImages[i]);
        }
      }

      // API call to add product
      const response = await axios.post(
        'https://fb-m90x.onrender.com/seller/addproduct',
        formData,
        {
          headers: {
            token: cookies.get('token'),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Add Product Response:', response.data);
      
      if (response.data.status === 'success') {
        setSuccess('Product added successfully!');
        
        // Reset form and previews
        resetForm();
        setMainImagePreview('');
        setSubImagesPreview([]);
        
        // Navigate to products page after short delay
        setTimeout(() => {
          navigate('/seller/my-products');
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add product');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Generate slug from title
  const generateSlug = (title, setFieldValue) => {
    const slugText = title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
    setFieldValue('slug', slugText);
  };

  // Handle main image selection with preview
  const handleMainImageChange = (event, setFieldValue) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0];
      setFieldValue('mainImage', file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle sub images selection with previews
  const handleSubImagesChange = (event, setFieldValue) => {
    if (event.currentTarget.files) {
      const filesArray = Array.from(event.currentTarget.files);
      setFieldValue('subImages', filesArray);
      
      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setSubImagesPreview(previewsArray);
    }
  };

  // Remove a sub image
  const removeSubImage = (index, values, setFieldValue) => {
    const updatedSubImages = [...values.subImages];
    updatedSubImages.splice(index, 1);
    setFieldValue('subImages', updatedSubImages);

    const updatedPreviews = [...subImagesPreview];
    URL.revokeObjectURL(updatedPreviews[index]); // Clean up URL object
    updatedPreviews.splice(index, 1);
    setSubImagesPreview(updatedPreviews);
  };

  // Remove main image
  const removeMainImage = (setFieldValue) => {
    setFieldValue('mainImage', null);
    setMainImagePreview('');
  };

  return (
    <div className="container py-4">
      <div className="card bg-dark text-white">
        <div className="card-header">
          <h2 className="m-0">Add New Product</h2>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </div>
          )}
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ isSubmitting, values, setFieldValue, errors, touched }) => (
              <Form>
                <div className="row g-3">
                  {/* Title */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="title" className="form-label">Product Title *</label>
                      <Field
                        type="text"
                        className={`form-control bg-dark text-white border-secondary ${touched.title && errors.title ? 'is-invalid' : ''}`}
                        id="title"
                        name="title"
                        placeholder="Enter product title"
                        onBlur={(e) => {
                          // Generate slug when title field loses focus
                          if (e.target.value && (!values.slug || values.slug === '')) {
                            generateSlug(e.target.value, setFieldValue);
                          }
                        }}
                      />
                      <ErrorMessage name="title" component="div" className="invalid-feedback" />
                    </div>
                  </div>
                  
                  {/* Slug */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="slug" className="form-label">Product Slug *</label>
                      <Field
                        type="text"
                        className={`form-control bg-dark text-white border-secondary ${touched.slug && errors.slug ? 'is-invalid' : ''}`}
                        id="slug"
                        name="slug"
                        placeholder="product-url-slug"
                      />
                      <ErrorMessage name="slug" component="div" className="invalid-feedback" />
                      <small className="form-text text-muted">Auto-generated from title, you can edit if needed</small>
                    </div>
                  </div>
                  
                  {/* Product Link */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="productLink" className="form-label">Product Link</label>
                      <Field
                        type="url"
                        className={`form-control bg-dark text-white border-secondary ${touched.productLink && errors.productLink ? 'is-invalid' : ''}`}
                        id="productLink"
                        name="productLink"
                        placeholder="https://example.com/product"
                      />
                      <ErrorMessage name="productLink" component="div" className="invalid-feedback" />
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="price" className="form-label">Price *</label>
                      <Field
                        type="number"
                        className={`form-control bg-dark text-white border-secondary ${touched.price && errors.price ? 'is-invalid' : ''}`}
                        id="price"
                        name="price"
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                      />
                      <ErrorMessage name="price" component="div" className="invalid-feedback" />
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="categoryId" className="form-label">Category *</label>
                      <Field
                        as="select"
                        className={`form-select bg-dark text-white border-secondary ${touched.categoryId && errors.categoryId ? 'is-invalid' : ''}`}
                        id="categoryId"
                        name="categoryId"
                      >
                        <option value="">Select Category</option>
                        {Array.isArray(categories) && categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="categoryId" component="div" className="invalid-feedback" />
                    </div>
                  </div>
                  
                  {/* Main Image */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="mainImage" className="form-label">Main Image *</label>
                      <input
                        type="file"
                        className={`form-control bg-dark text-white border-secondary ${!values.mainImage && 'is-invalid'}`}
                        id="mainImage"
                        name="mainImage"
                        onChange={(event) => handleMainImageChange(event, setFieldValue)}
                        accept="image/*"
                      />
                      {!values.mainImage && (
                        <div className="invalid-feedback">Main image is required</div>
                      )}
                    </div>
                    
                    {mainImagePreview && (
                      <div className="mb-3">
                        <div className="position-relative d-inline-block">
                          <img 
                            src={mainImagePreview} 
                            alt="Main Preview" 
                            className="img-thumbnail bg-dark border-secondary"
                            style={{ maxHeight: '150px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            onClick={() => removeMainImage(setFieldValue)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Sub Images */}
                  <div className="col-12">
                    <div className="form-group mb-3">
                      <label htmlFor="subImages" className="form-label">Additional Images</label>
                      <input
                        type="file"
                        className="form-control bg-dark text-white border-secondary"
                        id="subImages"
                        name="subImages"
                        onChange={(event) => handleSubImagesChange(event, setFieldValue)}
                        accept="image/*"
                        multiple
                      />
                      <small className="form-text text-muted">You can select multiple images</small>
                    </div>
                    
                    {subImagesPreview.length > 0 && (
                      <div className="mb-3">
                        <div className="d-flex flex-wrap gap-2">
                          {subImagesPreview.map((preview, index) => (
                            <div key={index} className="position-relative d-inline-block">
                              <img
                                src={preview}
                                alt={`Sub Preview ${index + 1}`}
                                className="img-thumbnail bg-dark border-secondary"
                                style={{ maxHeight: '120px' }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                onClick={() => removeSubImage(index, values, setFieldValue)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="col-12">
                    <div className="form-group mb-3">
                      <label htmlFor="description" className="form-label">Description *</label>
                      <Field
                        as="textarea"
                        className={`form-control bg-dark text-white border-secondary ${touched.description && errors.description ? 'is-invalid' : ''}`}
                        id="description"
                        name="description"
                        rows="5"
                        placeholder="Enter product description"
                      />
                      <ErrorMessage name="description" component="div" className="invalid-feedback" />
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="col-12">
                    <div className="d-flex justify-content-end mt-3">
                      <button
                        type="button"
                        className="btn btn-outline-secondary me-2"
                        onClick={() => navigate('/seller/my-products')}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={isSubmitting || loading}
                      >
                        {(isSubmitting || loading) ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Adding Product...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus me-2"></i>
                            Add Product
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}