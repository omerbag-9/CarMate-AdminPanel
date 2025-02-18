import React from 'react'

export default function AddUser() {
    return (
        <div className="container mt-5">
            <form className="bg-dark text-white p-4 rounded">
                <h2 className="text-center mb-5 mt-3">User</h2>
                <div className="row g-5">
                    {/* First row - 3 inputs */}
                    <div className="col-md-4">
                        <label htmlFor="firstName" className="form-label">
                            <i className="fas fa-user me-2"></i>First Name
                        </label>
                        <input type="text" className="form-control" id="firstName" name="firstName" />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="lastName" className="form-label">
                            <i className="fas fa-user me-2"></i>Last Name
                        </label>
                        <input type="text" className="form-control" id="lastName" name="lastName" />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="email" className="form-label">
                            <i className="fas fa-envelope me-2"></i>Email address
                        </label>
                        <input type="email" className="form-control" id="email" name="email" />
                    </div>

                    {/* Second row - 3 inputs */}
                    <div className="col-md-4">
                        <label htmlFor="password" className="form-label">
                            <i className="fas fa-lock me-2"></i>Password
                        </label>
                        <input type="password" className="form-control" id="password" name="password" />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="phone" className="form-label">
                            <i className="fas fa-phone me-2"></i>Phone
                        </label>
                        <input type="tel" className="form-control" id="phone" name="phone" />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="role" className="form-label">
                            <i className="fas fa-user-tag me-2"></i>Role
                        </label>
                        <select className="form-select" id="role" name="role">
                            <option value="Worker">Worker</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                        </select>
                    </div>

                    {/* Third row - 2 inputs */}
                    <div className="col-md-6">
                        <label htmlFor="inActive" className="form-label">
                            <i className="fas fa-toggle-on me-2"></i>InActive
                        </label>
                        <select className="form-select" id="inActive" name="inActive">
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="status" className="form-label">
                            <i className="fas fa-check-circle me-2"></i>Status
                        </label>
                        <select className="form-select" id="status" name="status">
                            <option value="Verified">Verified</option>
                            <option value="Pending">Pending</option>
                            <option value="Blocked">Blocked</option>
                        </select>
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