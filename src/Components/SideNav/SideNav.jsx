import React, { useContext, useEffect, useState } from 'react';
import pp from '../../assets/pp.png';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import Cookies from 'js-cookie';

const navItems = [
    { path: '/users', icon: 'fa-solid fa-user', text: 'Users', roles: ['admin'] },
    { path: '/workers', icon: 'fa-solid fa-users', text: 'Worker', roles: ['admin'] },
    { path: '/sellers', icon: 'fa-solid fa-award', text: 'Seller', roles: ['admin'] },
    { path: '/products', icon: 'fa-solid fa-chart-line', text: 'Product', roles: ['admin'] },
    { path: '/category', icon: 'fa-solid fa-list', text: 'Category', roles: ['admin'] },
    { path: '/myProducts', icon: 'fa-solid fa-chart-line', text: 'Product', roles: ['seller'] },
];

export default function SideNav({ onClose }) {
    const { getProfile } = useContext(UserContext);
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function getUserProfile() {
        setLoading(true);
        let data = await getProfile();
        setProfile(data.data);
        setLoading(false);
    }

    useEffect(() => {
        getUserProfile();
    }, []);

    const role = Cookies.get('role') || profile.role;

    const handleLogout = () => {
        // Clear all cookies
        Object.keys(Cookies.get()).forEach(cookieName => {
            Cookies.remove(cookieName);
        });
        // Navigate to login page
        navigate('/login');
    };

    return (
        <div className='position-fixed start-0 side-nav vh-100 bg-dark d-flex flex-column' style={{ width: '200px' }}>
            <div className="row d-flex align-items-center mt-3 mx-1">
                <div className="col-4">
                    <img src={profile.profilePhoto} className='w-100 rounded-circle' alt="Profile" />
                </div>
                <div className="col-8">
                    {loading ? (
                        <div className="h6 text-white mb-0">UserName</div>
                    ) : (
                        <h6 className='text-white m-0 text-break'>
                            {profile.firstName?.trim() + ' ' + profile.lastName?.trim()}
                        </h6>
                    )}
                    <small className='text-white m-0'>{role}</small>
                </div>
                {/* Close button for mobile */}
                <button
                    className="btn-close btn-close-white position-absolute top-0 end-0 m-2 d-lg-none"
                    onClick={onClose}
                    aria-label="Close"
                ></button>
            </div>

            <ul className="nav flex-column mt-3">
                {navItems
                    .filter(({ roles }) => roles.includes(role))
                    .map(({ path, icon, text }) => (
                        <li key={path} className="nav-item">
                            <NavLink
                                to={path}
                                className={({ isActive }) =>
                                    `nav-link text-light d-flex align-items-center py-2 px-2 rounded position-relative ${
                                        isActive ? 'active-link active-line' : ''
                                    }`
                                }
                                onClick={() => onClose?.()}
                            >
                                <i className={`${icon} me-2`}></i>
                                <small>{text}</small>
                            </NavLink>
                        </li>
                    ))}
            </ul>

            {/* Logout button */}
            <button
                onClick={handleLogout}
                className="btn btn-danger mt-auto mb-3 mx-3 d-flex align-items-center justify-content-center"
            >
                <i className="fa-solid fa-sign-out-alt me-2"></i>
                <small>Logout</small>
            </button>
        </div>
    );
}