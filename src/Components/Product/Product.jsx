import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import Loader from '../Loader/Loader';

export default function Product() {
    const [allProductsData, setAllProductsData] = useState([]); // All products
    const [paginatedProducts, setPaginatedProducts] = useState([]); // Displayed products
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        sortBy: '',
        order: 'asc'
    });
    const [deleteLoading, setDeleteLoading] = useState(null); // Track which product is being deleted

    const ITEMS_PER_PAGE = 10;

    // Fetch all products at once
    async function fetchAllProducts() {
        setLoading(true);
        try {
            let url = `https://fb-m90x.onrender.com/admin/getAllproducts?size=1000`;
            const { data } = await axios.get(url, { headers: { token: Cookies.get('token') } });
            setAllProductsData(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching all products:', error);
            setLoading(false);
        }
    }

    // Apply client-side filtering and pagination
    useEffect(() => {
        let filteredProducts = allProductsData;

        if (searchTerm) {
            const lowercaseSearch = searchTerm.toLowerCase();
            filteredProducts = allProductsData.filter(product =>
                product.title && product.title.toLowerCase().includes(lowercaseSearch)
            );
        }

        if (filters.sortBy) {
            filteredProducts = [...filteredProducts].sort((a, b) => {
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

        const calculatedTotalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
        setTotalPages(calculatedTotalPages);

        if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
            setCurrentPage(1);
        }

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedResults = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        setPaginatedProducts(paginatedResults);
    }, [allProductsData, searchTerm, filters, currentPage]);

    useEffect(() => {
        fetchAllProducts();
    }, []);

    async function deleteProduct(id) {
        setDeleteLoading(id); // Set the ID of the product being deleted
        try {
            await axios.delete(`https://fb-m90x.onrender.com/admin/deleteproduct/${id}`, {
                headers: { token: Cookies.get('token') }
            });
            fetchAllProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            // Optionally show an error notification here
        } finally {
            setDeleteLoading(null); // Reset loading state regardless of outcome
        }
    }

    // Confirmation before deleting
    const confirmDelete = (id, title) => {
        // Using the browser's built-in confirm dialog
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            deleteProduct(id);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSortAsc = () => {
        setFilters({ sortBy: 'price', order: 'asc' });
    };

    const handleSortDesc = () => {
        setFilters({ sortBy: 'price', order: 'desc' });
    };

    const handleResetSort = () => {
        setFilters({ sortBy: '', order: 'asc' });
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
                        placeholder="Search by title"
                        style={{ height: '45px' }}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className="dropdown mt-2 mt-md-0 w-100 w-md-auto">
                    <button
                        className="btn btn-outline-light d-flex align-items-center gap-2 w-100"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <i className="fa-solid fa-sort"></i>
                        <span className="d-none d-sm-inline">Price Filter</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-dark">
                        <li><button className="dropdown-item" onClick={handleSortAsc}>Price: Low to High</button></li>
                        <li><button className="dropdown-item" onClick={handleSortDesc}>Price: High to Low</button></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item" onClick={handleResetSort}>Reset Filter</button></li>
                    </ul>
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
                                    <th>Image</th>
                                    <th className="d-none d-md-table-cell">ID</th>
                                    <th>Title</th>
                                    <th>
                                        Price
                                        {filters.sortBy === 'price' && (
                                            <i className={`fas fa-sort-${filters.order === 'asc' ? 'up' : 'down'} text-muted ms-1`}></i>
                                        )}
                                    </th>
                                    <th className="d-none d-lg-table-cell">Category</th>
                                    <th className="d-none d-md-table-cell">Created</th>
                                    <th>Link</th>
                                    <th>Actions</th> {/* New column for delete action */}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.length > 0 ? (
                                    paginatedProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <img
                                                    src={product.mainImage}
                                                    alt={product.title}
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="d-none d-md-table-cell">{product.id}</td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: '150px' }}>
                                                    {product.title}
                                                </div>
                                            </td>
                                            <td>${product.price}</td>
                                            <td className="d-none d-lg-table-cell">Category {product.categoryId}</td>
                                            <td className="d-none d-md-table-cell">{formatDate(product.createdAt)}</td>
                                            <td>
                                                <div className="d-flex justify-content-center">
                                                    <Link to={product.productLink} target="_blank" className="bg-transparent border-0 p-1">
                                                        <i className="fas fa-link text-primary"></i>
                                                    </Link>
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => confirmDelete(product.id, product.title)}
                                                    disabled={deleteLoading === product.id}
                                                >
                                                    {deleteLoading === product.id ? (
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    ) : (
                                                        <i className="fas fa-trash-alt"></i>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="8" className="text-center">No products found</td></tr>
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