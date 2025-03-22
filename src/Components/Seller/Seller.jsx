import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import Chart from 'chart.js/auto';
import Loader from '../Loader/Loader';

const UserAnalytics = ({ users }) => {
    const statusChartRef = useRef(null);

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
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#fff' } }
                    }
                }
            });
        }

        return () => {
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
                            <div className="chart-container" style={{ position: 'relative', height: '100%', width: '100%', maxWidth: '400px' }}>
                                <canvas id="statusChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Seller() {
    const [allUsersData, setAllUsersData] = useState([]); // All sellers for analytics and filtering
    const [paginatedUsers, setPaginatedUsers] = useState([]); // Displayed sellers
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

    // Fetch all sellers at once
    async function fetchAllSellers() {
        setLoading(true);
        try {
            let url = `https://fb-m90x.onrender.com/admin/getsellerusers?size=1000`;
            if (filters.isActive) url += `&isActive=${filters.isActive}`;
            if (filters.status) url += `&status=${filters.status}`;

            const { data } = await axios.get(url, { headers: { token: Cookies.get('token') } });
            setAllUsersData(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching all sellers:', error);
            setLoading(false);
        }
    }

    // Apply client-side filtering and pagination
    useEffect(() => {
        let filteredUsers = allUsersData;

        if (searchTerm) {
            const lowercaseSearch = searchTerm.toLowerCase();
            filteredUsers = allUsersData.filter(user =>
                user.firstName && user.firstName.toLowerCase().includes(lowercaseSearch)
            );
        }

        if (filters.sortBy) {
            filteredUsers = [...filteredUsers].sort((a, b) => {
                let valueA = a[filters.sortBy];
                let valueB = b[filters.sortBy];
                if (typeof valueA === 'string') {
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
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

        const calculatedTotalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
        setTotalPages(calculatedTotalPages);

        if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
            setCurrentPage(1);
        }

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedResults = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        setPaginatedUsers(paginatedResults);
    }, [allUsersData, searchTerm, filters, currentPage]);

    useEffect(() => {
        fetchAllSellers();
    }, [filters.isActive, filters.status]);

    async function deleteUser(id) {
        try {
            await axios.delete(`https://fb-m90x.onrender.com/admin/deleteuser/${id}`, {
                headers: { token: Cookies.get('token') }
            });
            fetchAllSellers();
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
            <div className="d-flex align-items-center gap-3 p-3 mt-4">
                <div className="position-relative flex-grow-1">
                    <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                    <input
                        type="search"
                        className="form-control bg-dark text-white ps-5 border-0 custom-placeholder"
                        placeholder="Search by first name (type to search)"
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
                        <i className="fa-solid fa-sliders"></i> Filters
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
                    <i className="fa-solid fa-plus"></i> Add User
                </Link>
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className="container-fluid px-3">
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
                                    Phone Number <i className={`fas fa-sort${filters.sortBy === 'phone' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
                                </th>
                                <th>Role</th>
                                <th onClick={() => handleSort('isActive')} style={{ cursor: 'pointer' }}>
                                    Is Active <i className={`fas fa-sort${filters.sortBy === 'isActive' ? (filters.order === 'asc' ? '-up' : '-down') : ''} text-muted ms-1`}></i>
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
                                        <td><Link to={`/specific-user/${user.id}`}><button className="btn btn-outline-light py-0">details</button></Link></td>
                                        <td>{user.id}</td>
                                        <td>{user.firstName}</td>
                                        <td>{user.phone || 'N/A'}</td>
                                        <td>{user.role}</td>
                                        <td>{user.isActive ? 'yes' : 'no'}</td>
                                        <td>
                                            <span className={`badge ${user.status === 'verified' ? 'bg-success' : user.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <button onClick={() => deleteUser(user.id)} className="bg-transparent border-0 p-1">
                                                    <i className="fas fa-trash text-danger"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="8" className="text-center">No sellers found</td></tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="8">
                                    <div className="d-flex my-2 justify-content-between align-items-center">
                                        <button className="btn btn-secondary" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                                        <span className="text-white">Page {currentPage} of {totalPages || 1}</span>
                                        <button className="btn btn-secondary" onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <UserAnalytics users={allUsersData} />
                </div>
            )}
        </div>
    );
}