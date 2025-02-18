import React from 'react'
import { Link } from 'react-router-dom'

export default function Seller() {
  return (
    <>
           {/* search */}
           <div className="d-flex align-items-center gap-3 p-3 mt-4">
               <div className="position-relative flex-grow-1">
                   <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                   <input
                       type="search"
                       className="form-control bg-dark text-white ps-5 border-0 custom-placeholder"
                       placeholder="Search"
                       style={{ height: '45px' }}
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
                       <li><a className="dropdown-item" href="#">Name</a></li>
                       <li><a className="dropdown-item" href="#">Date</a></li>
                       <li><a className="dropdown-item" href="#">Status</a></li>
                   </ul>
               </div>

               <Link
                   to="/add-user"
                   className="btn btn-primary d-flex align-items-center gap-2"
               >
                   <i className="fa-solid fa-plus"></i>
                   Add User
               </Link>
           </div>
           {/* search */}

           {/* table */}
           <div className="container-fluid px-3">
               <table className="table table-dark table-hover">
                   <thead>
                       <tr>
                           <th><input type="checkbox" className="form-check-input" checked={true} disabled /></th>
                           <th>ID <i className="fas fa-sort text-muted"></i></th>
                           <th>Name <i className="fas fa-sort text-muted"></i></th>
                           <th>Phone Number <i className="fas fa-sort text-muted"></i></th>
                           <th>Role <i className="fas fa-sort text-muted"></i></th>
                           <th>Is Active <i className="fas fa-sort text-muted"></i></th>
                           <th>Status <i className="fas fa-sort text-muted"></i></th>
                           <th>Actions</th>
                       </tr>
                   </thead>
                   <tbody>
                       <tr>
                           <td><input type="checkbox" className="form-check-input" /></td>
                           <td>000001</td>
                           <td>Fawzy</td>
                           <td>01020870445</td>
                           <td>Seller</td>
                           <td>Yes</td>
                           <td><span className="badge bg-success">Verified</span></td>
                           <td>
                               <div className="d-flex justify-content-center gap-2">
                                   <button className='bg-transparent border-0 p-1'><i className="fas fa-trash text-danger "></i></button>
                                   <button className='bg-transparent border-0 p-1'><i className="fas fa-pencil-alt text-primary"></i></button>
                               </div>
                           </td>
                       </tr>
                   </tbody>
                   <tfoot>
                       <tr>
                           <td colSpan="8">
                               <div className="d-flex my-2 justify-content-between align-items-center">
                                   <button className="btn btn-secondary">Previous</button>
                                   <span>Page 1 of 10</span>
                                   <button className="btn btn-secondary">Next</button>
                               </div>
                           </td>
                       </tr>
                   </tfoot>
               </table>
           </div>
           {/* table */}
       </>
  )
}
