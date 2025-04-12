import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import Cookies from 'js-cookie';
import person from '../../assets/default-avatar.png';

const navItems = [
    { path: '/users', icon: 'fa-solid fa-user', text: 'Users', roles: ['admin'] },
    { path: '/workers', icon: 'fa-solid fa-users', text: 'Worker', roles: ['admin'] },
    { path: '/sellers', icon: 'fa-solid fa-award', text: 'Seller', roles: ['admin'] },
    { path: '/products', icon: 'fa-solid fa-chart-line', text: 'Product', roles: ['admin'] },
    { path: '/category', icon: 'fa-solid fa-list', text: 'Category', roles: ['admin'] },
    { path: '/myProducts', icon: 'fa-solid fa-chart-line', text: 'Product', roles: ['seller'] },
];

export default function SideNav({ onClose, isOpen }) {
    const { getProfile } = useContext(UserContext);
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function getUserProfile() {
        setLoading(true);
        let data = await getProfile();
        setProfile(data?.data?.user);
        setLoading(false);
    }

    useEffect(() => {
        getUserProfile();
    }, []);

    const role = Cookies.get('role') || profile.role;

    const handleLogout = () => {
        Object.keys(Cookies.get()).forEach(cookieName => {
            Cookies.remove(cookieName);
        });
        navigate('/login');
    };

    const sidebarClass = `position-fixed start-0 side-nav vh-100 bg-dark d-flex flex-column ${isOpen ? 'show-sidebar' : 'hide-sidebar'}`;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark d-lg-none"
                    style={{ opacity: 0.5, zIndex: 999 }}
                    onClick={onClose}
                ></div>
            )}

            <div className={sidebarClass} style={{ width: '250px', zIndex: 1000, transition: 'transform 0.3s ease' }}>
                {/* Logout button for mobile (top) */}
                <div className="d-lg-none px-3 pt-3">
                    <button
                        onClick={handleLogout}
                        className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
                    >
                        <i className="fa-solid fa-sign-out-alt me-2"></i>
                        <span>Logout</span>
                    </button>
                </div>

                <div className="row d-flex align-items-center mt-3 mx-1 position-relative">
                    <div className="col-4">
                        <div
                            className="rounded-circle overflow-hidden"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <img
                                src={profile.profilePhoto || person}
                                alt="Profile"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
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

                <ul className="nav flex-column mt-3 w-100">
                    {navItems
                        .filter(({ roles }) => roles.includes(role))
                        .map(({ path, icon, text }) => (
                            <li key={path} className="nav-item w-100">
                                <NavLink
                                    to={path}
                                    className={({ isActive }) =>
                                        `nav-link text-light d-flex align-items-center py-2 px-3 rounded position-relative w-100 ${isActive ? 'active-link active-line' : ''
                                        }`
                                    }
                                    onClick={() => onClose?.()}
                                >
                                    <i className={`${icon} me-2`}></i>
                                    <span>{text}</span>
                                </NavLink>
                            </li>
                        ))}
                </ul>

                {/* Logout button for desktop (bottom) */}
                <div className="d-none d-lg-block mt-auto mb-3 px-3">
                    <button
                        onClick={handleLogout}
                        className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
                    >
                        <i className="fa-solid fa-sign-out-alt me-2"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}
