import axios from 'axios';
import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrash } from 'react-icons/fa';

export default function Category() {
    let [errMsg, setErrMsg] = useState('');
    let [isLoading, setIsLoading] = useState(false);
    let [successMsg, setSuccessMsg] = useState('');
    let [categories, setCategories] = useState([]);
    let [subcategories, setSubcategories] = useState([]);
    let [deleteLoading, setDeleteLoading] = useState(false);
    let [subCategoryLoading, setSubCategoryLoading] = useState(false);

    // Validation schema for the category form
    const categoryValidationSchema = Yup.object({
        name: Yup.string().required('English name is required'),
        arabicName: Yup.string().required('Arabic name is required')
    });

    // Validation schema for the subcategory form
    const subcategoryValidationSchema = Yup.object({
        categoryId: Yup.string().required('Category is required'),
        name: Yup.string().required('English name is required'),
        arabicName: Yup.string().required('Arabic name is required')
    });

    const categoryFormik = useFormik({
        initialValues: {
            name: '',
            arabicName: ''
        },
        validationSchema: categoryValidationSchema,
        onSubmit: addCategory
    });

    const subcategoryFormik = useFormik({
        initialValues: {
            categoryId: '',
            name: '',
            arabicName: ''
        },
        validationSchema: subcategoryValidationSchema,
        onSubmit: addSubcategory
    });

    // Fetch all categories and subcategories when component mounts
    useEffect(() => {
        fetchCategories();
        fetchSubcategories();
    }, []);

    // Function to fetch all categories
    async function fetchCategories() {
        try {
            const { data } = await axios.get(
                'https://fb-m90x.onrender.com/admin/getAllCategories',
                {
                    headers: { token: Cookies.get('token') }
                }
            );
            if (data.status === 'success') {
                setCategories(data.data || []);
                console.log('Categories fetched:', data.data);
            }
        } catch (err) {
            setErrMsg(err.message);
            console.log(err.message);
            setCategories([]);
        }
    }

    // Function to fetch all subcategories
    async function fetchSubcategories() {
        try {
            const { data } = await axios.get(
                'https://fb-m90x.onrender.com/admin/getAllSubCategories',
                {
                    headers: { token: Cookies.get('token') }
                }
            );
            if (data.status === 'success') {
                setSubcategories(data.data || []);
                console.log('Subcategories fetched:', data.data);
            }
        } catch (err) {
            setErrMsg(err.message);
            console.log(err.message);
            setSubcategories([]);
        }
    }

    // Function to delete a category
    async function deleteCategory(id) {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }
        
        setDeleteLoading(true);
        try {
            const { data } = await axios.delete(
                `https://fb-m90x.onrender.com/admin/deleteCategory/${id}`,
                {
                    headers: { token: Cookies.get('token') }
                }
            );
            
            if (data.status === 'success') {
                toast.success('Category deleted successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                fetchCategories();
            }
        } catch (err) {
            setErrMsg(err.message);
            toast.error(err.message);
            console.log(err.message);
        } finally {
            setDeleteLoading(false);
        }
    }

    // Function to delete a subcategory
    async function deleteSubcategory(id) {
        if (!window.confirm('Are you sure you want to delete this subcategory?')) {
            return;
        }
        
        setDeleteLoading(true);
        try {
            const { data } = await axios.delete(
                `https://fb-m90x.onrender.com/admin/deleteSubCategory/${id}`,
                {
                    headers: { token: Cookies.get('token') }
                }
            );
            
            if (data.status === 'success') {
                toast.success('Subcategory deleted successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                fetchSubcategories();
            }
        } catch (err) {
            setErrMsg(err.message);
            toast.error(err.message);
            console.log(err.message);
        } finally {
            setDeleteLoading(false);
        }
    }

    async function addCategory(values) {
        setIsLoading(true);
        setErrMsg('');
        setSuccessMsg('');
        try {
            let { data } = await axios.post(
                'https://fb-m90x.onrender.com/admin/addcategory',
                values, {
                    headers: { token: Cookies.get('token') }
                }
            );

            if (data.status === 'category created successfully') {
                console.log(data);
                categoryFormik.resetForm();
                toast.success('Category added successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setSuccessMsg('Category added successfully!');
                fetchCategories();
            }
        } catch (err) {
            setErrMsg(err.message);
            console.log(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function addSubcategory(values) {
        setSubCategoryLoading(true);
        setErrMsg('');
        setSuccessMsg('');
        try {
            let { data } = await axios.post(
                'https://fb-m90x.onrender.com/admin/addSubCategory',
                values, {
                    headers: { token: Cookies.get('token') }
                }
            );

            if (data.status === 'success' || data.status === 'subcategory created successfully') {
                console.log(data);
                subcategoryFormik.resetForm();
                toast.success('Subcategory added successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setSuccessMsg('Subcategory added successfully!');
                fetchSubcategories();
            }
        } catch (err) {
            setErrMsg(err.message);
            console.log(err.message);
        } finally {
            setSubCategoryLoading(false);
        }
    }

    // Helper function to get category name by ID
    const getCategoryNameById = (categoryId) => {
        const category = categories.find(cat => cat.id == categoryId);
        return category ? category.name : 'Unknown';
    };

    return (
        <>
            <ToastContainer />
            <h2 className="my-5 text-white">Category & Subcategory Management</h2>
            {errMsg && <div className="alert alert-danger p-1 w-50 mx-auto">{errMsg}</div>}
            {successMsg && <div className="alert alert-success p-1 w-50 mx-auto">{successMsg}</div>}
            
            {/* Add Category Form */}
            <div className="mb-5">
                <h3 className="text-white mb-4">Add New Category</h3>
                <form className="d-flex flex-column align-items-center" onSubmit={categoryFormik.handleSubmit}>
                    <div className="mb-3 w-50">
                        <input
                            className="form-control py-2"
                            placeholder="English Category Name"
                            type="text"
                            id="name"
                            name="name"
                            value={categoryFormik.values.name}
                            onChange={categoryFormik.handleChange}
                            onBlur={categoryFormik.handleBlur}
                        />
                        {categoryFormik.touched.name && categoryFormik.errors.name && (
                            <div className="text-danger">{categoryFormik.errors.name}</div>
                        )}
                    </div>
                    
                    <div className="mb-3 w-50">
                        <input
                            className="form-control py-2"
                            placeholder="Arabic Category Name"
                            type="text"
                            id="arabicName"
                            name="arabicName"
                            value={categoryFormik.values.arabicName}
                            onChange={categoryFormik.handleChange}
                            onBlur={categoryFormik.handleBlur}
                        />
                        {categoryFormik.touched.arabicName && categoryFormik.errors.arabicName && (
                            <div className="text-danger">{categoryFormik.errors.arabicName}</div>
                        )}
                    </div>
                    
                    <div>
                        {isLoading ? (
                            <button type="button" className="btn btn-primary px-5 py-2" disabled>
                                Loading...
                            </button>
                        ) : (
                            <button className="btn btn-primary px-5 py-2" type="submit">
                                Add Category
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Add Subcategory Form */}
            <div className="mb-5">
                <h3 className="text-white mb-4">Add New Subcategory</h3>
                <form className="d-flex flex-column align-items-center" onSubmit={subcategoryFormik.handleSubmit}>
                    <div className="mb-3 w-50">
                        <select
                            className="form-control py-2"
                            id="categoryId"
                            name="categoryId"
                            value={subcategoryFormik.values.categoryId}
                            onChange={subcategoryFormik.handleChange}
                            onBlur={subcategoryFormik.handleBlur}
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name} ({category.arabicName})
                                </option>
                            ))}
                        </select>
                        {subcategoryFormik.touched.categoryId && subcategoryFormik.errors.categoryId && (
                            <div className="text-danger">{subcategoryFormik.errors.categoryId}</div>
                        )}
                    </div>

                    <div className="mb-3 w-50">
                        <input
                            className="form-control py-2"
                            placeholder="English Subcategory Name"
                            type="text"
                            id="name"
                            name="name"
                            value={subcategoryFormik.values.name}
                            onChange={subcategoryFormik.handleChange}
                            onBlur={subcategoryFormik.handleBlur}
                        />
                        {subcategoryFormik.touched.name && subcategoryFormik.errors.name && (
                            <div className="text-danger">{subcategoryFormik.errors.name}</div>
                        )}
                    </div>
                    
                    <div className="mb-3 w-50">
                        <input
                            className="form-control py-2"
                            placeholder="Arabic Subcategory Name"
                            type="text"
                            id="arabicName"
                            name="arabicName"
                            value={subcategoryFormik.values.arabicName}
                            onChange={subcategoryFormik.handleChange}
                            onBlur={subcategoryFormik.handleBlur}
                        />
                        {subcategoryFormik.touched.arabicName && subcategoryFormik.errors.arabicName && (
                            <div className="text-danger">{subcategoryFormik.errors.arabicName}</div>
                        )}
                    </div>
                    
                    <div>
                        {subCategoryLoading ? (
                            <button type="button" className="btn btn-success px-5 py-2" disabled>
                                Loading...
                            </button>
                        ) : (
                            <button className="btn btn-success px-5 py-2" type="submit">
                                Add Subcategory
                            </button>
                        )}
                    </div>
                </form>
            </div>
            
            {/* Categories List */}
            <div className="mt-5">
                <h3 className="text-white mb-4">All Categories</h3>
                {categories.length === 0 ? (
                    <p className="text-white text-center">No categories found.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>English Name</th>
                                    <th>Arabic Name</th>
                                    <th>Slug</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category, index) => (
                                    <tr key={category.id}>
                                        <td>{index + 1}</td>
                                        <td>{category.name}</td>
                                        <td>{category.arabicName}</td>
                                        <td>{category.slug}</td>
                                        <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deleteCategory(category.id)}
                                                disabled={deleteLoading}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Subcategories List */}
            <div className="mt-5">
                <h3 className="text-white mb-4">All Subcategories</h3>
                {subcategories.length === 0 ? (
                    <p className="text-white text-center">No subcategories found.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Category</th>
                                    <th>English Name</th>
                                    <th>Arabic Name</th>
                                    <th>Slug</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subcategories.map((subcategory, index) => (
                                    <tr key={subcategory.id}>
                                        <td>{index + 1}</td>
                                        <td>{getCategoryNameById(subcategory.categoryId)}</td>
                                        <td>{subcategory.name}</td>
                                        <td>{subcategory.arabicName}</td>
                                        <td>{subcategory.slug}</td>
                                        <td>{new Date(subcategory.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deleteSubcategory(subcategory.id)}
                                                disabled={deleteLoading}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}