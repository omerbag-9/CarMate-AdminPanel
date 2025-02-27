import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import Loader from '../Loader/Loader';

export default function Worker() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        sortBy: '',
        order: 'asc',
        isActive: '',
        status: ''
    });

    async function getAllWorkers(page = 1) {
        setLoading(true);
        try {
            let url = `https://fb-m90x.onrender.com/admin/getworkerusers?page=${page}&size=5`;

            if (searchTerm) {
                url += `&keyword=${searchTerm}`;
            }
            if (filters.sortBy) {
                url += `&sort=${filters.sortBy}:${filters.order}`;
            }
            if (filters.isActive) {
                url += `&isActive=${filters.isActive}`;
            }
            if (filters.status) {
                url += `&status=${filters.status}`;
            }

            let { data } = await axios.get(url, {
                headers: {
                    token: Cookies.get('token')
                }
            });

            setWorkers(data.data);
            setTotalPages(Math.ceil(data.count / 5));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching workers:', error);
            setLoading(false);
        }
    }

    async function deleteWorker(id) {
        try {
            await axios.delete(`https://fb-m90x.onrender.com/admin/deleteuser/${id}`, {
                headers: {
                    token: Cookies.get('token')
                }
            });
            getAllWorkers(currentPage);
        } catch (err) {
            console.error('Error deleting worker:', err);
        }
    }

    useEffect(() => {
        getAllWorkers(currentPage);
    }, [currentPage, filters, searchTerm]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            order: prev.sortBy === field && prev.order === 'asc' ? 'desc' : 'asc'
        }));
        setCurrentPage(1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    // Function to determine badge class based on status
    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified':
                return 'badge bg-success';
            case 'pending':
                return 'badge bg-warning'; // Using warning for yellow, text-dark for readability
            case 'blocked':
                return 'badge bg-danger';
            default:
                return 'badge bg-secondary';
        }
    };

    return (
        <>
            {/* Search */}
            <div className="d-flex align-items-center gap-3 p-3 mt-4">
                <div className="position-relative flex-grow-1">
                    <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                    <input
                        type="search"
                        className="form-control bg-dark text-white ps-5 border-0 custom-placeholder"
                        placeholder="Search Workers"
                        style={{ height: '45px' }}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="dropdown">
                    <button
                        className="btn btn-outline-light d-flex align-items-center gap-2"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <i className="fa-solid fa-sliders"></i>
                        Filters
                    </button>
                    <ul className="dropdown-menu dropdown-menu-dark">
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => setFilters(prev => ({ ...prev, isActive: '', status: '' }))}
                            >
                                All Workers
                            </button>
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => setFilters(prev => ({ ...prev, isActive: 'true' }))}
                            >
                                Active Workers
                            </button>
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => setFilters(prev => ({ ...prev, isActive: 'false' }))}
                            >
                                Inactive Workers
                            </button>
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => setFilters(prev => ({ ...prev, status: 'verified' }))}
                            >
                                Verified Workers
                            </button>
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
                            >
                                Pending Workers
                            </button>
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => setFilters(prev => ({ ...prev, status: 'blocked' }))}
                            >
                                Blocked Workers
                            </button>
                        </li>
                    </ul>
                </div>

                <Link
                    to="/add-worker"
                    className="btn btn-primary d-flex align-items-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i>
                    Add Worker
                </Link>
            </div>

            {loading ? (
                <Loader />
            ) : (
                <>
                    {/* Table */}
                    <div className="container-fluid px-3">
                        <table className="table table-dark table-hover">
                            <thead>
                                <tr>
                                    <th>Details</th>
                                    <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                                        ID
                                        <i className={`fas fa-sort${filters.sortBy === 'id' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
                                    </th>
                                    <th onClick={() => handleSort('firstName')} style={{ cursor: 'pointer' }}>
                                        Name
                                        <i className={`fas fa-sort${filters.sortBy === 'firstName' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
                                    </th>
                                    <th onClick={() => handleSort('phone')} style={{ cursor: 'pointer' }}>
                                        Phone Number
                                        <i className={`fas fa-sort${filters.sortBy === 'phone' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
                                    </th>
                                    <th>Role</th>
                                    <th onClick={() => handleSort('isActive')} style={{ cursor: 'pointer' }}>
                                        Is Active
                                        <i className={`fas fa-sort${filters.sortBy === 'isActive' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
                                    </th>
                                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                        Status
                                        <i className={`fas fa-sort${filters.sortBy === 'status' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
                                    </th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workers.map((worker) => (
                                    <tr key={worker.id}>
                                        <td>
                                            <Link to={`/specific-worker/${worker.id}`}>
                                                <button className="btn btn-outline-light py-0">
                                                    details
                                                </button>
                                            </Link>
                                        </td>
                                        <td>{worker.id}</td>
                                        <td>{worker.firstName}</td>
                                        <td>{worker.phone ? worker.phone : 'N/A'}</td>
                                        <td>{worker.role}</td>
                                        <td>{worker.isActive ? 'yes' : 'no'}</td>
                                        <td>
                                            <span className={getStatusBadgeClass(worker.status)}>
                                                {worker.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    onClick={() => deleteWorker(worker.id)}
                                                    className="bg-transparent border-0 p-1"
                                                >
                                                    <i className="fas fa-trash text-danger"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="8">
                                        <div className="d-flex my-2 justify-content-between align-items-center">
                                            <button
                                                className="btn btn-secondary"
                                                onClick={handlePrevPage}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </button>
                                            <span>Page {currentPage} of {totalPages}</span>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={handleNextPage}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </>
            )}
        </>
    );
}