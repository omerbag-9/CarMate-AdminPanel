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
    let [deleteLoading, setDeleteLoading] = useState(false);

    // Validation schema for the form
    const validationSchema = Yup.object({
        name: Yup.string().required('English name is required'),
        arabicName: Yup.string().required('Arabic name is required')
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            arabicName: ''
        },
        validationSchema,
        onSubmit: addCategory
    });

    // Fetch all categories when component mounts
    useEffect(() => {
        fetchCategories();
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
                // The API now returns data in a different structure
                // data.data contains the array of categories
                setCategories(data.data || []);
                console.log('Categories fetched:', data.data);
            }
        } catch (err) {
            setErrMsg(err.message);
            console.log(err.message);
            // Ensure categories is set to an empty array on error
            setCategories([]);
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
                // Refresh categories list
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
                formik.resetForm();
                toast.success('Category added successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setSuccessMsg('Category added successfully!');
                // Refresh categories list
                fetchCategories();
            }
        } catch (err) {
            setErrMsg(err.message);
            console.log(err.message);
            
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <ToastContainer />
            <h2 className="my-5 text-white">Category Management</h2>
            {errMsg && <div className="alert alert-danger p-1 w-50 mx-auto">{errMsg}</div>}
            {successMsg && <div className="alert alert-success p-1 w-50 mx-auto">{successMsg}</div>}
            
            {/* Add Category Form */}
            <div className="mb-5">
                <h3 className="text-white mb-4">Add New Category</h3>
                <form className="d-flex flex-column align-items-center" onSubmit={formik.handleSubmit}>
                    <div className="mb-3 w-50">
                        <input
                            className="form-control py-2"
                            placeholder="English Category Name"
                            type="text"
                            id="name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <div className="text-danger">{formik.errors.name}</div>
                        )}
                    </div>
                    
                    <div className="mb-3 w-50">
                        <input
                            className="form-control py-2"
                            placeholder="Arabic Category Name"
                            type="text"
                            id="arabicName"
                            name="arabicName"
                            value={formik.values.arabicName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.arabicName && formik.errors.arabicName && (
                            <div className="text-danger">{formik.errors.arabicName}</div>
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
        </>
    );
}