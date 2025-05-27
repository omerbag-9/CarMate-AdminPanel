import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import cookies from 'js-cookie';
import Loader from '../Loader/Loader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Fetch products owned by the seller
  async function getOwnProducts() {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await axios.get('https://fb-m90x.onrender.com/seller/getownedProducts', {
        headers: { token: cookies.get('token') }
      });
      
      // Debug logging to see exact structure
      console.log('API Response:', data);
      
      // Safely access nested properties with optional chaining
      const productsData = data?.data?.result?.data || [];
      
      if (Array.isArray(productsData) && productsData.length > 0) {
        setProducts(productsData);
      } else {
        console.log('No products found or invalid data structure:', productsData);
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }



  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    
    setDeletingProductId(productId);
    
    try {
      const response = await axios.delete(`https://fb-m90x.onrender.com/seller/deleteProduct/${productId}`, {
        headers: { token: cookies.get('token') }
      });
      
      if (response.data.status === 'success') {
        toast.success('Product deleted successfully');
        
        // Remove the product from the state
        setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      } else {
        toast.error('Failed to delete product: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error(err.response?.data?.message || 'Failed to delete product. Please try again.');
    } finally {
      setDeletingProductId(null);
    }
  };

  useEffect(() => {
    getOwnProducts();
  }, []);

  // Format price safely
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0.00';
    
    // If price is already a string, just return it with $ prefix
    if (typeof price === 'string') {
      // Try to parse it as a number first
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice)) {
        return numPrice.toFixed(2);
      }
      return price; // Return as is if parsing fails
    }
    
    // If it's a number, format it
    if (typeof price === 'number') {
      return price.toFixed(2);
    }
    
    return '0.00'; // Fallback
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    // Handle potentially missing properties safely
    const productName = product?.title || '';
    
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Refresh products handler
  const handleRefresh = () => {
    getOwnProducts();
  };

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white m-0">My Products</h2>
        <div>
          <button onClick={handleRefresh} className="btn btn-outline-light me-2">
            <i className="fas fa-sync-alt me-1"></i> Refresh
          </button>
          <Link to="/seller/add-product" className="btn btn-success">
            <i className="fas fa-plus me-1"></i> Add New Product
          </Link>
        </div>
      </div>

      <div className="card bg-dark text-white mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-12">
              <div className="input-group">
                <span className="input-group-text bg-dark text-white border-secondary">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Loader />
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-white mb-3">
            <i className="fas fa-box-open fa-3x"></i>
          </div>
          <h4 className="text-white">No products added yet</h4>
          <p className="text-muted">Start selling by adding your first product</p>
          <Link to="/seller/add-product" className="btn btn-primary mt-2">
            <i className="fas fa-plus me-2"></i>Add Your First Product
          </Link>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          No products match your search criteria. Try adjusting your filter options.
        </div>
      ) : (
        <div className="row g-4">
          {filteredProducts.map((product) => (
            <div className="col-lg-3 col-md-4 col-sm-6" key={product.id || Math.random().toString()}>
              <div className="card h-100 bg-dark text-white border-secondary product-card">
                <div 
                  className="card-img-top"
                  style={{
                    backgroundImage: `url(${product.mainImage || 'https://via.placeholder.com/300x200?text=No+Image'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '200px',
                    position: 'relative',
                  }}
                >
                  {product.status === 'sale' && (
                    <span className="badge bg-danger position-absolute top-0 end-0 m-2">
                      Sale
                    </span>
                  )}
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-truncate">{product.title || 'Unnamed Product'}</h5>
                  <p className="card-text text-success fw-bold mt-2 mb-3">
                    ${formatPrice(product.price)}
                  </p>
                  <div className="d-flex mt-auto">
                    <Link 
                      to={`/seller/getSpecificProduct/${product.id}`} 
                      className="btn btn-outline-light flex-grow-1 me-2"
                    >
                      <i className="fas fa-eye me-1"></i> View
                    </Link>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={deletingProductId === product.id}
                    >
                      {deletingProductId === product.id ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="fas fa-trash-alt"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}