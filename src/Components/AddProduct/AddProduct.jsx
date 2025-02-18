import React from 'react'

export default function AddProduct() {
    return (
        <div className="container mt-5">
            <form className="bg-dark text-white p-4 rounded">
                <h2 className="text-center mb-5 mt-3">Product</h2>
                <div className="row g-3">
                    {/* First row - 3 inputs */}
                    <div className="col-md-4">
                        <label htmlFor="title" className="form-label">
                            <i className="fas fa-heading me-2"></i>Title
                        </label>
                        <input type="text" className="form-control" id="title" name="title" />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="mainImage" className="form-label">
                            <i className="fas fa-image me-2"></i>Main Image
                        </label>
                        <input type="file" className="form-control" id="mainImage" name="mainImage" />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="subImages" className="form-label">
                            <i className="fas fa-images me-2"></i>Sub Images
                        </label>
                        <input type="file" className="form-control" id="subImages" name="subImages" multiple />
                    </div>

                    {/* Second row - 3 inputs */}
                    <div className="col-md-4">
                        <label htmlFor="category" className="form-label">
                            <i className="fas fa-tag me-2"></i>Category
                        </label>
                        <select className="form-select" id="category" name="category">
                            <option value="">Select Category</option>
                            <option value="electronics">Electronics</option>
                            <option value="clothing">Clothing</option>
                            <option value="books">Books</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="description" className="form-label">
                            <i className="fas fa-align-left me-2"></i>Description
                        </label>
                        <textarea className="form-control" id="description" name="description" rows="3"></textarea>
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="productLink" className="form-label">
                            <i className="fas fa-link me-2"></i>Product Link
                        </label>
                        <input type="url" className="form-control" id="productLink" name="productLink" />
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-3">
                    <button type="button" className="btn btn-danger me-2">
                        <i className="fas fa-trash me-2"></i>Clear
                    </button>
                    <button type="submit" className="btn btn-primary">
                        <i className="fas fa-plus me-2"></i>Add
                    </button>
                </div>
            </form>
        </div>
    )
}