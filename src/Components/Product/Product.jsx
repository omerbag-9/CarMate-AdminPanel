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

    const ITEMS_PER_PAGE = 5;

    // Fetch all products at once
    async function fetchAllProducts() {
        setLoading(true);
        try {
            let url = `https://fb-m90x.onrender.com/admin/getAllproducts?size=1000`;
            const { data } = await axios.get(url, { headers: { token: Cookies.get('token') } }); // Fixed typo here
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
        try {
            await axios.delete(`https://fb-m90x.onrender.com/admin/deleteproduct/${id}`, {
                headers: { token: Cookies.get('token') }
            });
            fetchAllProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    }

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
            <div className="d-flex align-items-center gap-3 p-3 mt-4">
                <div className="position-relative flex-grow-1">
                    <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                    <input
                        type="search"
                        className="form-control bg-dark text-white ps-5 border-0 custom-placeholder"
                        placeholder="Search by title (type to search)"
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
                        <i className="fa-solid fa-sort"></i> Price Filter
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
                <div className="container-fluid px-3">
                    <table className="table table-dark table-hover">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>ID</th>
                                <th>Title</th>
                                <th>
                                    Price
                                    {filters.sortBy === 'price' && (
                                        <i className={`fas fa-sort-${filters.order === 'asc' ? 'up' : 'down'} text-muted ms-1`}></i>
                                    )}
                                </th>
                                <th>Category</th>
                                <th>Created</th>
                                <th>Product Link</th>
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
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                className="rounded"
                                            />
                                        </td>
                                        <td>{product.id}</td>
                                        <td>{product.title}</td>
                                        <td>${product.price}</td>
                                        <td>Category {product.categoryId}</td>
                                        <td>{formatDate(product.createdAt)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <Link to={product.productLink} target="_blank" className="bg-transparent border-0 p-1">
                                                    <i className="fas fa-link text-primary"></i>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="text-center">No products found</td></tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="7">
                                    <div className="d-flex my-2 justify-content-between align-items-center">
                                        <button className="btn btn-secondary" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                                        <span className="text-white">Page {currentPage} of {totalPages || 1}</span>
                                        <button className="btn btn-secondary" onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
}