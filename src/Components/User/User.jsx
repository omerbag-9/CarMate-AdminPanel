import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import Chart from 'chart.js/auto';
import Loader from '../Loader/Loader';

const UserAnalytics = ({ users }) => {
    const statusChartRef = useRef(null);
    const chartContainerRef = useRef(null);

    const calculateAnalytics = () => {
        const statusCount = users.reduce((acc, user) => {
            acc[user.status] = (acc[user.status] || 0) + 1;
            return acc;
        }, {});

        return { statusCount };
    };

    useEffect(() => {
        const analytics = calculateAnalytics();

        if (statusChartRef.current) {
            statusChartRef.current.destroy();
        }

        const statusCtx = document.getElementById('statusChart');
        if (statusCtx) {
            statusChartRef.current = new Chart(statusCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(analytics.statusCount),
                    datasets: [{
                        data: Object.values(analytics.statusCount),
                        backgroundColor: ['#0d6efd', '#198754', '#dc3545', '#ffc107']
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: { 
                            position: 'bottom', 
                            labels: { color: '#fff' },
                            // Make legend more responsive
                            display: window.innerWidth > 400
                        }
                    }
                }
            });
        }

        const handleResize = () => {
            if (statusChartRef.current) {
                // Update legend display based on screen size
                statusChartRef.current.options.plugins.legend.display = window.innerWidth > 400;
                statusChartRef.current.update();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (statusChartRef.current) statusChartRef.current.destroy();
        };
    }, [users]);

    return (
        <div className="p-3">
            <h4 className="text-white mb-4 text-center">User Status Distribution</h4>
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="card bg-dark text-white">
                        <div className="card-body d-flex justify-content-center">
                            <div 
                                ref={chartContainerRef}
                                className="chart-container" 
                                style={{ 
                                    position: 'relative', 
                                    height: '300px',
                                    width: '100%', 
                                    maxWidth: '400px' 
                                }}
                            >
                                <canvas id="statusChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function User() {
    const [allUsersData, setAllUsersData] = useState([]); // Store all users for client-side filtering
    const [paginatedUsers, setPaginatedUsers] = useState([]); // Displayed users (filtered and paginated)
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

    // Fetch all users at once
    async function fetchAllUsers() {
        setLoading(true);
        try {
            let url = `https://fb-m90x.onrender.com/admin/getcustomerusers?size=1000`; // Get a large batch of users
            if (filters.isActive) url += `&isActive=${filters.isActive}`;
            if (filters.status) url += `&status=${filters.status}`;
            
            const { data } = await axios.get(url, { headers: { token: Cookies.get('token') } });
            setAllUsersData(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching all users:', error);
            setLoading(false);
        }
    }

    // Apply client-side filtering and pagination
    useEffect(() => {
        // Filter by search term (case insensitive partial match)
        let filteredUsers = allUsersData;
        
        if (searchTerm) {
            const lowercaseSearch = searchTerm.toLowerCase();
            filteredUsers = allUsersData.filter(user => 
                user.firstName && user.firstName.toLowerCase().includes(lowercaseSearch)
            );
        }
        
        // Apply sorting if needed
        if (filters.sortBy) {
            filteredUsers = [...filteredUsers].sort((a, b) => {
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
        
        // Calculate total pages
        const calculatedTotalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
        setTotalPages(calculatedTotalPages);
        
        // Adjust current page if it's out of bounds after filtering
        if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
            setCurrentPage(1);
        }
        
        // Apply pagination
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedResults = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        
        setPaginatedUsers(paginatedResults);
    }, [allUsersData, searchTerm, filters, currentPage]);

    // Fetch all users when component mounts or filters change
    useEffect(() => {
        fetchAllUsers();
    }, [filters.isActive, filters.status]);

    async function deleteUser(id) {
        try {
            await axios.delete(`https://fb-m90x.onrender.com/admin/deleteuser/${id}`, {
                headers: { token: Cookies.get('token') }
            });
            fetchAllUsers(); // Refresh all users
        } catch (err) {
            console.error('Error deleting user:', err);
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
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, isActive: '', status: '' }))}>All Users</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, isActive: 'true' }))}>Active Users</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, isActive: 'false' }))}>Inactive Users</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, status: 'verified' }))}>Verified Users</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}>Pending Users</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilters(prev => ({ ...prev, status: 'blocked' }))}>Blocked Users</button></li>
                        </ul>
                    </div>
                    <Link to="/add-user" className="btn btn-primary d-flex align-items-center gap-2">
                        <i className="fa-solid fa-plus"></i>
                        <span className="d-none d-sm-inline">Add User</span>
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
                                {paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <Link to={`/specific-user/${user.id}`}>
                                                    <button className="btn btn-outline-light btn-sm py-0">
                                                        <i className="fas fa-info-circle d-inline d-sm-none"></i>
                                                        <span className="d-none d-sm-inline">details</span>
                                                    </button>
                                                </Link>
                                            </td>
                                            <td>{user.id}</td>
                                            <td>{user.firstName}</td>
                                            <td>{user.phone ? user.phone : 'N/A'}</td>
                                            <td className="d-none d-md-table-cell">{user.role}</td>
                                            <td className="d-none d-lg-table-cell">{user.isActive ? 'yes' : 'no'}</td>
                                            <td>
                                                <span className={`badge ${user.status === 'verified' ? 'bg-success' : user.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center">
                                                    <button onClick={() => deleteUser(user.id)} className="bg-transparent border-0 p-1">
                                                        <i className="fas fa-trash text-danger"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">No users found</td>
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

                    <UserAnalytics users={allUsersData} />
                </div>
            )}
        </div>
    );
}