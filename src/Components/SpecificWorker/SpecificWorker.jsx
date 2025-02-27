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
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters'),
    phone: Yup.string().matches(/^[0-9]+$/, 'Phone must be a valid number'),
    role: Yup.string().required('Role is required'),
    specialization: Yup.string().when('role', {
        is: (role) => role === 'worker',
        then: () => Yup.string().required('Specialization is required for workers')
    }),
    location: Yup.string(),
    isActive: Yup.string().required('Active status is required'),
    status: Yup.string().required('Status is required'),
});

export default function SpecificWorker() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get user ID from URL (e.g., /update-user/29)
    const [initialValues, setInitialValues] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: '',
        specialization: '',
        location: '',
        isActive: '',
        status: '',
    });
    const [originalEmail, setOriginalEmail] = useState(''); // Store the original email
    const [loading, setLoading] = useState(true);

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`https://fb-m90x.onrender.com/admin/getSpecificUser/${id}`, {
                    headers: {
                        token: Cookies.get('token'),
                    },
                });
                const userData = response.data.data; // Adjust based on your API response structure
                console.log('Fetched User Data:', userData); // Debug log

                const userValues = {
                    firstName: userData.user.firstName || '',
                    lastName: userData.user.lastName || '',
                    email: userData.user.email || '',
                    password: '', // Leave blank for updates
                    phone: userData.user.phone || '',
                    role: userData.user.role || '',
                    specialization: userData.worker.specialization|| '',
                    location: userData.worker.location || '',
                    isActive: userData.user.isActive ? 'Yes' : 'No', // Convert boolean to Yes/No
                    status: userData.user.status || '',
                };
                setInitialValues(userValues);
                setOriginalEmail(userData.user.email || ''); // Store original email separately
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user:', error.response?.data || error);
                toast.error('Failed to load user data');
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            const payload = {
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                role: values.role,
                specialization: values.specialization,
                location: values.location,
                isActive: values.isActive === 'Yes', // Convert to boolean
                status: values.status,
            };

            // Include email in payload only if it has changed
            if (values.email !== originalEmail) {
                payload.email = values.email;
            }

            // Include password only if provided
            if (values.password) {
                payload.password = values.password;
            }

            console.log('Payload to Send:', payload); // Debug log to verify payload

            const response = await axios.put(
                `https://fb-m90x.onrender.com/admin/updateUser/${id}`,
                payload,
                {
                    headers: {
                        token: Cookies.get('token'),
                    },
                }
            );

            console.log('Update Response:', response.data); // Debug log

            if (response.data.status === 'user updated successfully') {
                toast.success('User updated successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setTimeout(() => {
                    navigate('/workers');
                }, 1500); // Delay navigation
            } else {
                console.log('Success condition not met:', response.data.status);
            }
        } catch (error) {
            console.log(error);
            
            console.error('Error updating user:', error.response?.data);
            setStatus(error.response?.data?.message || 'Error updating user');
            toast.error(error.response?.data?.message || 'Error updating user');
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
                {({ isSubmitting, status, values }) => (
                    <Form className="bg-dark text-white p-4 rounded">
                        <h2 className="text-center mb-5 mt-3">Update User</h2>

                        {status && (
                            <div className="alert alert-danger mb-4">{status}</div>
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
                                    <i className="fas fa-lock me-2"></i>Password (Leave blank to keep unchanged)
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
                                </Field>
                                <ErrorMessage name="role" component="div" className="text-danger mt-1" />
                            </div>

                            {/* New row for specialization and location */}
                            <div className="col-md-6">
                                <label htmlFor="specialization" className="form-label">
                                    <i className="fas fa-tools me-2"></i>Specialization
                                </label>
                                <Field
                                    as="select"
                                    className="form-select"
                                    id="specialization"
                                    name="specialization"
                                    disabled={values.role !== 'worker'}
                                >
                                    <option value="">Select Specialization</option>
                                    <option value="Mechanic">Mechanic</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="CarPlumber">CarPlumber</option>
                                </Field>
                                <ErrorMessage name="specialization" component="div" className="text-danger mt-1" />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="location" className="form-label">
                                    <i className="fas fa-map-marker-alt me-2"></i>Location
                                </label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="location"
                                    name="location"
                                    placeholder="Enter worker location"
                                />
                                <ErrorMessage name="location" component="div" className="text-danger mt-1" />
                            </div>

                            {/* Last row - is active and status */}
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
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                <i className="fas fa-save me-2"></i>
                                {isSubmitting ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}