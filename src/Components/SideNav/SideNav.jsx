import React from 'react'
import pp from '../../assets/pp.png'
import { Link, NavLink } from 'react-router-dom'

const navItems = [
    { path: '/users', icon: 'fa-solid fa-user', text: 'Users' },
    { path: '/workers', icon: 'fa-solid fa-users', text: 'Worker' },
    { path: '/sellers', icon: 'fa-solid fa-award', text: 'Seller' },
    { path: '/products', icon: 'fa-solid fa-chart-line', text: 'Product' },
];

export default function SideNav() {
    return (
        <div className='position-fixed top-0 start-0 side-nav  vh-100'>
            <div className="row d-flex align-items-center mt-4 ms-1">
                <div className="col-4 m-0">
                    <img src={pp} className='w-100' alt="" />
                </div>
                <div className="col-8 m-0 align-items-center">
                    <h4 className='text-white m-0'>Omer Bag</h4>
                    <p className='text-white m-0'>Super Admin</p>
                </div>
            </div>

            <ul className="nav flex-column mt-4">
                {navItems.map(({ path, icon, text }) => (
                    <li key={path} className="nav-item">
                        <NavLink
                            to={path}
                            className={({ isActive }) =>
                                `nav-link text-light d-flex align-items-center py-3 rounded position-relative ${isActive ? 'active-link active-line' : ''}`
                            }
                        >
                            <i className={`${icon} me-3`}></i>
                            {text}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    )
}
