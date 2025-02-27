import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import Loader from '../Loader/Loader';

export default function Product() {
    const [paginatedProducts, setPaginatedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        sortBy: '',
        order: 'asc'
    });

    // Fetch paginated products for the table
    async function getPaginatedProducts(page = 1) {
        setLoading(true);
        try {
            let url = `https://fb-m90x.onrender.com/admin/getAllproducts?page=${page}&size=5`;
            if (searchTerm) url += `&title=${searchTerm}`;
            if (filters.sortBy) url += `&sort=${filters.sortBy}:${filters.order}`;

            const { data } = await axios.get(url, { headers: { token: Cookies.get('token') } });
            setPaginatedProducts(data.data);
            setTotalPages(Math.ceil(data.count / 5));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching paginated products:', error);
            setLoading(false);
        }
    }

    async function deleteProduct(id) {
        try {
            await axios.delete(`https://fb-m90x.onrender.com/admin/deleteproduct/${id}`, {
                headers: { token: Cookies.get('token') }
            });
            getPaginatedProducts(currentPage);
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    }

    useEffect(() => {
        getPaginatedProducts(currentPage);
    }, [currentPage, filters, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSortAsc = () => {
        setFilters({
            sortBy: 'price',
            order: 'asc'
        });
        setCurrentPage(1);
    };

    const handleSortDesc = () => {
        setFilters({
            sortBy: 'price',
            order: 'desc'
        });
        setCurrentPage(1);
    };

    const handleResetSort = () => {
        setFilters({
            sortBy: '',
            order: 'asc'
        });
        setCurrentPage(1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    // Format date to a more readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    };

    return (
        <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-3 p-3 mt-4">
                <div className="position-relative flex-grow-1">
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
                <div className="dropdown">
                    <button
                        className="btn btn-outline-light d-flex align-items-center gap-2"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <i className="fa-solid fa-sort"></i>
                        Price Filter
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
                            {paginatedProducts.map((product) => (
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
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="7">
                                    <div className="d-flex my-2 justify-content-between align-items-center">
                                        <button className="btn btn-secondary" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                                        <span className="text-white">Page {currentPage} of {totalPages}</span>
                                        <button className="btn btn-secondary" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
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