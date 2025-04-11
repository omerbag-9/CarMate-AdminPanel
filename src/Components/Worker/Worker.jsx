import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import Loader from '../Loader/Loader';

export default function Worker() {
    const [allWorkersData, setAllWorkersData] = useState([]); // Store all workers
    const [paginatedWorkers, setPaginatedWorkers] = useState([]); // Displayed workers
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

    const ITEMS_PER_PAGE = 5;

    // Fetch all workers at once
    async function fetchAllWorkers() {
        setLoading(true);
        try {
            let url = `https://fb-m90x.onrender.com/admin/getworkerusers?size=1000`; // Large batch
            if (filters.isActive) url += `&isActive=${filters.isActive}`;
            if (filters.status) url += `&status=${filters.status}`;

            const { data } = await axios.get(url, { headers: { token: Cookies.get('token') } });
            setAllWorkersData(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching all workers:', error);
            setLoading(false);
        }
    }

    // Apply client-side filtering and pagination
    useEffect(() => {
        let filteredWorkers = allWorkersData;

        if (searchTerm) {
            const lowercaseSearch = searchTerm.toLowerCase();
            filteredWorkers = allWorkersData.filter(worker =>
                worker.firstName && worker.firstName.toLowerCase().includes(lowercaseSearch)
            );
        }

        if (filters.sortBy) {
            filteredWorkers = [...filteredWorkers].sort((a, b) => {
                let valueA = a[filters.sortBy];
                let valueB = b[filters.sortBy];
                
                // Handle null or undefined values
                if (valueA === null || valueA === undefined) valueA = '';
                if (valueB === null || valueB === undefined) valueB = '';
                
                // Handle string comparison vs. numeric comparison
                if (typeof valueA === 'string' || typeof valueB === 'string') {
                    // Convert both to strings to ensure safe comparison
                    valueA = String(valueA).toLowerCase();
                    valueB = String(valueB).toLowerCase();
                    return filters.order === 'asc'
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);
                } else {
                    return filters.order === 'asc'
                        ? valueA - valueB
                        : valueB - valueA;
                }
            });
        }

        const calculatedTotalPages = Math.ceil(filteredWorkers.length / ITEMS_PER_PAGE);
        setTotalPages(calculatedTotalPages);

        if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
            setCurrentPage(1);
        }

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedResults = filteredWorkers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        setPaginatedWorkers(paginatedResults);
    }, [allWorkersData, searchTerm, filters, currentPage]);

    useEffect(() => {
        fetchAllWorkers();
    }, [filters.isActive, filters.status]);

    async function deleteWorker(id) {
        try {
            await axios.delete(`https://fb-m90x.onrender.com/admin/deleteuser/${id}`, {
                headers: { token: Cookies.get('token') }
            });
            fetchAllWorkers();
        } catch (err) {
            console.error('Error deleting worker:', err);
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            order: prev.sortBy === field && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const getStatusBadgeClass = (status) => {
        if (!status) return 'badge bg-secondary';
        
        switch (status.toLowerCase()) {
            case 'verified': return 'badge bg-success';
            case 'pending': return 'badge bg-warning';
            case 'blocked': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    };

    return (
        <div className="d-flex flex-column">
            {/* Top controls - fully responsive */}
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 gap-md-3 p-2 p-md-3 mt-2 mt-md-4">
                <div className="position-relative flex-grow-1 w-100">
                    <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                    <input
                        type="search"
                        className="form-control bg-dark text-white ps-5 border-0 custom-placeholder"
                        placeholder="Search by first name"
                        style={{ height: '45px' }}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className="d-flex gap-2 mt-2 mt-md-0 w-100 w-md-auto">
                    <div className="dropdown">
                        <button
                            className="btn btn-outline-light d-flex align-items-center gap-2 w-100"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <i className="fa-solid fa-sliders"></i>
                            <span className="d-none d-sm-inline">Filters</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-dark">
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, isActive: '', status: '' }))}>All Workers</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, isActive: 'true' }))}>Active Workers</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, isActive: 'false' }))}>Inactive Workers</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, status: 'verified' }))}>Verified Workers</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}>Pending Workers</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, status: 'blocked' }))}>Blocked Workers</button></li>
                        </ul>
                    </div>
                    <Link to="/add-worker" className="btn btn-primary d-flex align-items-center gap-2">
                        <i className="fa-solid fa-plus"></i>
                        <span className="d-none d-sm-inline">Add Worker</span>
                    </Link>
                </div>
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className="container-fluid px-2 px-md-3">
                    {/* Responsive table with horizontal scrolling on small screens */}
                    <div className="table-responsive">
                        <table className="table table-dark table-hover">
                            <thead>
                                <tr>
                                    <th>Details</th>
                                    <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                                        ID <i className={`fas fa-sort${filters.sortBy === 'id' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
                                    </th>
                                    <th onClick={() => handleSort('firstName')} style={{ cursor: 'pointer' }}>
                                        Name <i className={`fas fa-sort${filters.sortBy === 'firstName' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
                                    </th>
                                    <th onClick={() => handleSort('phone')} style={{ cursor: 'pointer' }}>
                                        Phone <i className={`fas fa-sort${filters.sortBy === 'phone' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
                                    </th>
                                    <th className="d-none d-md-table-cell">Role</th>
                                    <th onClick={() => handleSort('isActive')} style={{ cursor: 'pointer' }} className="d-none d-lg-table-cell">
                                        Active <i className={`fas fa-sort${filters.sortBy === 'isActive' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
                                    </th>
                                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                        Status <i className={`fas fa-sort${filters.sortBy === 'status' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
                                    </th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedWorkers.length > 0 ? (
                                    paginatedWorkers.map((worker) => (
                                        <tr key={worker.id}>
                                            <td>
                                                <Link to={`/specific-worker/${worker.id}`}>
                                                    <button className="btn btn-outline-light btn-sm py-0">
                                                        <i className="fas fa-info-circle d-inline d-sm-none"></i>
                                                        <span className="d-none d-sm-inline">details</span>
                                                    </button>
                                                </Link>
                                            </td>
                                            <td>{worker.id}</td>
                                            <td>{worker.firstName}</td>
                                            <td>{worker.phone ? worker.phone : 'N/A'}</td>
                                            <td className="d-none d-md-table-cell">{worker.role}</td>
                                            <td className="d-none d-lg-table-cell">{worker.isActive ? 'yes' : 'no'}</td>
                                            <td>
                                                <span className={getStatusBadgeClass(worker.status)}>
                                                    {worker.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center">
                                                    <button onClick={() => deleteWorker(worker.id)} className="bg-transparent border-0 p-1">
                                                        <i className="fas fa-trash text-danger"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">No workers found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination controls - optimized for mobile */}
                    <div className="d-flex my-2 justify-content-between align-items-center flex-wrap px-2">
                        <button className="btn btn-secondary btn-sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                            <i className="fas fa-chevron-left me-1 d-inline d-sm-none"></i>
                            <span className="d-none d-sm-inline">Previous</span>
                        </button>
                        <span className="text-white my-2">Page {currentPage} of {totalPages || 1}</span>
                        <button className="btn btn-secondary btn-sm" onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                            <span className="d-none d-sm-inline">Next</span>
                            <i className="fas fa-chevron-right ms-1 d-inline d-sm-none"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}