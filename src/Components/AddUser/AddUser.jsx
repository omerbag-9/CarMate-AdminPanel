import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Validation Schema
const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&#])[A-Za-z\d@$!%?&#]{6,100}$/,'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 6 characters long').required('Password is required'),
    phone: Yup.string().matches(/^[0-9]+$/, 'Phone must be a valid number'),
    role: Yup.string().required('Role is required'),
    isActive: Yup.string().required('Active status is required'),
    status: Yup.string().required('Status is required'),
});

export default function AddUser() {
    const navigate = useNavigate();

    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'customer',
        isActive: 'Yes',
        status: 'verified',
    };

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            const response = await axios.post(
                'https://fb-m90x.onrender.com/admin/addUser',
                {
                    ...values,
                    isActive: values.isActive === 'Yes',
                },
                {
                    headers: {
                        token: Cookies.get('token'),
                    },
                }
            );
            
            if (response.data.status === 'user created successfully') {
                toast.success('User added successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Delay navigation to allow toast to display
                setTimeout(() => {
                    navigate('/users');
                }, 1500); // 1.5 seconds delay
            } else {
                console.log('Success condition not met:', response.data.message);
            }
        } catch (error) {
            console.error('Error adding user:', error.response?.data);
            setStatus(error.response?.data?.message || 'Error adding user');
            toast.error(error.response?.data?.message || 'Error adding user'); // Optional: Show error toast
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container">
            <ToastContainer />

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, status, resetForm }) => (
                    <Form className="bg-dark text-white p-4 rounded">
                        <h2 className="text-center mb-5 mt-3">Add User</h2>

                        {status && (
                            <div className="alert alert-danger mb-4">
                                {status}
                            </div>
                        )}

                        <div className="row g-5">
                            {/* First row - 3 inputs */}
                            <div className="col-md-4">
                                <label htmlFor="firstName" className="form-label">
                                    <i className="fas fa-user me-2"></i>First Name
                                </label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="firstName"
                                    name="firstName"
                                />
                                <ErrorMessage name="firstName" component="div" className="text-danger mt-1" />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="lastName" className="form-label">
                                    <i className="fas fa-user me-2"></i>Last Name
                                </label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="lastName"
                                    name="lastName"
                                />
                                <ErrorMessage name="lastName" component="div" className="text-danger mt-1" />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="email" className="form-label">
                                    <i className="fas fa-envelope me-2"></i>Email Address
                                </label>
                                <Field
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                />
                                <ErrorMessage name="email" component="div" className="text-danger mt-1" />
                            </div>

                            {/* Second row - 3 inputs */}
                            <div className="col-md-4">
                                <label htmlFor="password" className="form-label">
                                    <i className="fas fa-lock me-2"></i>Password
                                </label>
                                <Field
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    name="password"
                                />
                                <ErrorMessage name="password" component="div" className="text-danger mt-1" />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="phone" className="form-label">
                                    <i className="fas fa-phone me-2"></i>Phone
                                </label>
                                <Field
                                    type="tel"
                                    className="form-control"
                                    id="phone"
                                    name="phone"
                                />
                                <ErrorMessage name="phone" component="div" className="text-danger mt-1" />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="role" className="form-label">
                                    <i className="fas fa-user-tag me-2"></i>Role
                                </label>
                                <Field
                                    as="select"
                                    className="form-select"
                                    id="role"
                                    name="role"
                                >
                                    <option value="worker">Worker</option>
                                    <option value="admin">Admin</option>
                                    <option value="seller">Seller</option>
                                </Field>
                                <ErrorMessage name="role" component="div" className="text-danger mt-1" />
                            </div>

                            {/* Third row - 2 inputs */}
                            <div className="col-md-6">
                                <label htmlFor="isActive" className="form-label">
                                    <i className="fas fa-toggle-on me-2"></i>Is Active
                                </label>
                                <Field
                                    as="select"
                                    className="form-select"
                                    id="isActive"
                                    name="isActive"
                                >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </Field>
                                <ErrorMessage name="isActive" component="div" className="text-danger mt-1" />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="status" className="form-label">
                                    <i className="fas fa-check-circle me-2"></i>Status
                                </label>
                                <Field
                                    as="select"
                                    className="form-select"
                                    id="status"
                                    name="status"
                                >
                                    <option value="verified">Verified</option>
                                    <option value="pending">Pending</option>
                                    <option value="blocked">Blocked</option>
                                </Field>
                                <ErrorMessage name="status" component="div" className="text-danger mt-1" />
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-3">
                            <button
                                type="button"
                                className="btn btn-danger me-2"
                                onClick={() => resetForm()}
                                disabled={isSubmitting}
                            >
                                <i className="fas fa-trash me-2"></i>Clear
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                <i className="fas fa-plus me-2"></i>
                                {isSubmitting ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}