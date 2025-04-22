import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../Loader/Loader';

// Validation Schema
const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    price: Yup.string().required('Price is required'),
    productLink: Yup.string().url('Must be a valid URL'),
    description: Yup.string().required('Description is required'),
    // Arabic fields are optional
    arabicTitle: Yup.string().required('Arabic title is required'),
    arabicDescription: Yup.string().required('Arabic description is required'),
    subCategoryId: Yup.string().required('Subcategory is required'),
});

export default function GetSpecificProduct() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get product ID from URL
    const [initialValues, setInitialValues] = useState({
        title: '',
        arabicTitle: '',
        slug: '',
        productLink: '',
        price: '',
        description: '',
        arabicDescription: '',
        mainImage: '',
        subImages: [],
        subCategoryId: ''
    });
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [subImageFiles, setSubImageFiles] = useState([]);
    const [previewMainImage, setPreviewMainImage] = useState('');
    const [previewSubImages, setPreviewSubImages] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);

    // Fetch product data when component mounts
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`https://fb-m90x.onrender.com/seller/getSpecificProduct/${id}`, {
                    headers: {
                        token: Cookies.get('token'),
                    },
                });
                
                const data = response.data.data;
                console.log('Fetched Product Data:', data); // Debug log
                
                const productValues = {
                    title: data.product.title || '',
                    arabicTitle: data.product.arabicTitle || '',
                    slug: data.product.slug || '',
                    productLink: data.product.productLink || '',
                    price: data.product.price || '',
                    description: data.product.description || '',
                    arabicDescription: data.product.arabicDescription || '',
                    mainImage: data.product.mainImage || '',
                    subImages: data.product.subImages || [],
                    subCategoryId: data.product.subCategoryId || ''
                };
                
                setInitialValues(productValues);
                setPreviewMainImage(data.product.mainImage || '');
                setPreviewSubImages(data.product.subImages || []);
                setSeller(data.seller);
                
                // Fetch subcategories
                fetchSubCategories();
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error.response?.data || error);
                toast.error('Failed to load product data');
                setLoading(false);
            }
        };
        
        // Fetch subcategories and product data
        fetchProduct();
    }, [id]);

    // Fetch subcategories
    const fetchSubCategories = async () => {
        setSubCategoriesLoading(true);
        try {
            const response = await axios.get('https://fb-m90x.onrender.com/seller/getSubCategories/1');
            if (response.data.status === 'success' && Array.isArray(response.data.data.subCategories)) {
                setSubCategories(response.data.data.subCategories);
            } else {
                setSubCategories([]);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            toast.error('Failed to load subcategories');
            setSubCategories([]);
        } finally {
            setSubCategoriesLoading(false);
        }
    };

    // Handle main image file change
    const handleMainImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setMainImageFile(file);
            setPreviewMainImage(URL.createObjectURL(file));
        }
    };

    // Handle sub-images file change
    const handleSubImagesChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            setSubImageFiles(files);
            const previewUrls = files.map(file => URL.createObjectURL(file));
            setPreviewSubImages(previewUrls);
        }
    };

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            // Create FormData for image upload
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('productLink', values.productLink);
            formData.append('price', values.price);
            formData.append('description', values.description);
            
            // Append Arabic fields
            if (values.arabicTitle) {
                formData.append('arabicTitle', values.arabicTitle);
            }
            if (values.arabicDescription) {
                formData.append('arabicDescription', values.arabicDescription);
            }
            
            // Append subcategory
            if (values.subCategoryId) {
                formData.append('subCategoryId', values.subCategoryId);
            }
            
            // Append main image if changed
            if (mainImageFile) {
                formData.append('mainImage', mainImageFile);
            }
            
            // Append sub-images if changed
            if (subImageFiles.length > 0) {
                subImageFiles.forEach(file => {
                    formData.append('subImages', file);
                });
            }

            console.log('Payload to Send:', {
                ...values, 
                mainImageUpdated: !!mainImageFile,
                subImagesUpdated: subImageFiles.length > 0
            }); // Debug log

            const response = await axios.put(
                `https://fb-m90x.onrender.com/seller/updateProduct/${id}`,
                formData,
                {
                    headers: {
                        token: Cookies.get('token'),
                        'Content-Type': 'multipart/form-data'
                    },
                }
            );

            console.log('Update Response:', response.data); // Debug log

            toast.success('Product updated successfully!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Refresh product data
            const updatedResponse = await axios.get(`https://fb-m90x.onrender.com/seller/getSpecificProduct/${id}`, {
                headers: {
                    token: Cookies.get('token'),
                },
            });
            
            const updatedData = updatedResponse.data.data;
            const updatedProductValues = {
                title: updatedData.product.title || '',
                arabicTitle: updatedData.product.arabicTitle || '',
                slug: updatedData.product.slug || '',
                productLink: updatedData.product.productLink || '',
                price: updatedData.product.price || '',
                description: updatedData.product.description || '',
                arabicDescription: updatedData.product.arabicDescription || '',
                mainImage: updatedData.product.mainImage || '',
                subImages: updatedData.product.subImages || [],
                subCategoryId: updatedData.product.subCategoryId || ''
            };
            
            setInitialValues(updatedProductValues);
            setPreviewMainImage(updatedData.product.mainImage || '');
            setPreviewSubImages(updatedData.product.subImages || []);
            
            // Reset file states
            setMainImageFile(null);
            setSubImageFiles([]);
            
        } catch (error) {
            console.error('Error updating product:', error.response?.data);
            setStatus(error.response?.data?.message || 'Error updating product');
            toast.error(error.response?.data?.message || 'Error updating product');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container text-center mt-5">
                <Loader />
            </div>
        );
    }

    return (
        <div className="container">
            <ToastContainer />

            <Formik
                initialValues={initialValues}
                enableReinitialize={true} // Reinitialize form when initialValues change
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, status, setFieldValue, values }) => (
                    <Form className="bg-dark text-white p-4 rounded">
                        <h2 className="text-center mb-5 mt-3">Product Details</h2>

                        {status && (
                            <div className="alert alert-danger mb-4">{status}</div>
                        )}

                        <div className="row mb-4">
                            {/* Product Images */}
                            <div className="col-md-6">
                                <h4 className="mb-3">Product Images</h4>
                                
                                {/* Main Image */}
                                <div className="mb-3">
                                    <label className="form-label">Main Image</label>
                                    <div className="main-image mb-2">
                                        <img 
                                            src={previewMainImage} 
                                            alt={initialValues.title} 
                                            className="img-fluid rounded"
                                            style={{ height: '200px', width: 'auto', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={handleMainImageChange}
                                        accept="image/*"
                                    />
                                </div>
                                
                                {/* Sub Images */}
                                <div>
                                    <label className="form-label">Sub Images</label>
                                    <div className="sub-images d-flex flex-wrap mb-2">
                                        {previewSubImages.length > 0 ? (
                                            previewSubImages.map((img, index) => (
                                                <div key={index} className="sub-image me-2 mb-2">
                                                    <img 
                                                        src={img} 
                                                        alt={`${initialValues.title} - ${index+1}`} 
                                                        className="img-fluid rounded"
                                                        style={{ height: '60px', width: '60px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted">No sub-images available</p>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={handleSubImagesChange}
                                        accept="image/*"
                                        multiple
                                    />
                                    <small className="form-text text-muted">
                                        Select multiple files to replace all sub-images
                                    </small>
                                </div>
                            </div>
                            
                            {/* Seller Information */}
                            <div className="col-md-6">
                                <div className="seller-info">
                                    <h4 className="mb-3">
                                        <i className="fas fa-user-circle me-2"></i>
                                        Seller Information
                                    </h4>
                                    <div className="p-3 rounded bg-dark border">
                                        <div className="d-flex align-items-center mb-3">
                                            {seller.profilePhoto && seller.profilePhoto.length > 0 ? (
                                                <img 
                                                    src={seller.profilePhoto[0]} 
                                                    alt={`${seller.firstName} ${seller.lastName}`} 
                                                    className="rounded-circle me-3"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="rounded-circle me-3 bg-secondary d-flex justify-content-center align-items-center" 
                                                    style={{ width: '50px', height: '50px' }}>
                                                    <i className="fas fa-user text-light"></i>
                                                </div>
                                            )}
                                            <div>
                                                <h5 className="mb-0">{`${seller.firstName} ${seller.lastName}`}</h5>
                                                <p className="text-muted mb-0">ID: {seller.id}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-2">
                                            <i className="fas fa-envelope me-2 text-info"></i>
                                            {seller.email}
                                        </div>
                                        
                                        <div>
                                            <i className="fas fa-phone me-2 text-info"></i>
                                            {seller.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-4">
                            {/* Subcategory Field (replaces the Category and Subcategory fields) */}
                            <div className="col-md-6">
                                <label htmlFor="subCategoryId" className="form-label">
                                    <i className="fas fa-tag me-2"></i>Subcategory
                                </label>
                                <select
                                    className="form-control"
                                    id="subCategoryId"
                                    name="subCategoryId"
                                    value={values.subCategoryId}
                                    onChange={(e) => setFieldValue('subCategoryId', e.target.value)}
                                    disabled={subCategoriesLoading}
                                >
                                    <option value="">Select Subcategory</option>
                                    {subCategories.map(subCategory => (
                                        <option key={subCategory.id} value={subCategory.id}>
                                            {subCategory.name}
                                        </option>
                                    ))}
                                </select>
                                {subCategoriesLoading && <div className="spinner-border spinner-border-sm text-light ms-2"></div>}
                                {subCategories.length === 0 && !subCategoriesLoading && 
                                    <small className="form-text text-muted">No subcategories available</small>
                                }
                            </div>

                            {/* Title fields */}
                            <div className="col-md-6">
                                <label htmlFor="title" className="form-label">
                                    <i className="fas fa-heading me-2"></i>Title (English)
                                </label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="title"
                                    name="title"
                                />
                                <ErrorMessage name="title" component="div" className="text-danger mt-1" />
                            </div>
                            
                            <div className="col-md-4">
                                <label htmlFor="arabicTitle" className="form-label">
                                    <i className="fas fa-heading me-2"></i>Title (Arabic)
                                </label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="arabicTitle"
                                    name="arabicTitle"
                                    dir="rtl"
                                />
                                <ErrorMessage name="arabicTitle" component="div" className="text-danger mt-1" />
                            </div>
                            
                            <div className="col-md-4">
                                <label htmlFor="price" className="form-label">
                                    <i className="fas fa-money-bill me-2"></i>Price
                                </label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="price"
                                    name="price"
                                />
                                <ErrorMessage name="price" component="div" className="text-danger mt-1" />
                            </div>

                            {/* Slug and Product Link */}
                            <div className="col-md-4">
                                <label htmlFor="slug" className="form-label">
                                    <i className="fas fa-link me-2"></i>Slug
                                </label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="slug"
                                    name="slug"
                                    disabled={true} // Slug is typically auto-generated
                                />
                                <small className="form-text text-muted">Slug cannot be changed directly</small>
                            </div>
                            
                            <div className="col-md-8">
                                <label htmlFor="productLink" className="form-label">
                                    <i className="fas fa-external-link-alt me-2"></i>Product Link
                                </label>
                                <Field
                                    type="url"
                                    className="form-control"
                                    id="productLink"
                                    name="productLink"
                                />
                                <ErrorMessage name="productLink" component="div" className="text-danger mt-1" />
                            </div>

                            {/* Descriptions */}
                            <div className="col-md-6">
                                <label htmlFor="description" className="form-label">
                                    <i className="fas fa-file-alt me-2"></i>Description (English)
                                </label>
                                <Field
                                    as="textarea"
                                    className="form-control"
                                    id="description"
                                    name="description"
                                    rows="4"
                                />
                                <ErrorMessage name="description" component="div" className="text-danger mt-1" />
                            </div>
                            
                            <div className="col-md-6">
                                <label htmlFor="arabicDescription" className="form-label">
                                    <i className="fas fa-file-alt me-2"></i>Description (Arabic)
                                </label>
                                <Field
                                    as="textarea"
                                    className="form-control"
                                    id="arabicDescription"
                                    name="arabicDescription"
                                    rows="4"
                                    dir="rtl"
                                />
                                <ErrorMessage name="arabicDescription" component="div" className="text-danger mt-1" />
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                <i className="fas fa-save me-2"></i>
                                {isSubmitting ? 'Updating...' : 'Update Product'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-outline-light ms-2" 
                                onClick={() => navigate('/myProducts')}
                            >
                                <i className="fas fa-arrow-left me-2"></i>
                                Back to Products
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}