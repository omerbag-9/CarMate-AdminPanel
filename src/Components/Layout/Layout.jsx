import React, { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from '../SideNav/SideNav';
import Header from '../Header/Header';
import { UserContext } from '../../Context/UserContext';

export default function Layout() {
  const { loading } = useContext(UserContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="background" style={{ minHeight: '100vh', overflow: 'auto' }}>
      <div className="p-0">
        {/* Hamburger menu for mobile */}
        <button
          className="btn btn-dark d-lg-none position-fixed top-0 start-0 mt-2 ms-2 z-3"
          onClick={toggleSidebar}
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <div className="row g-0" style={{ minHeight: '100vh' }}>
          {/* Sidebar */}
          <div className={`col-lg-2 d-lg-block ${isSidebarOpen ? 'd-block' : 'd-none'}`}>
            <SideNav onClose={() => setIsSidebarOpen(false)} />
          </div>

          {/* Main content */}
          <div className="col-lg-10 col-12 d-flex flex-column">
            <Header />
            <main className="container-fluid flex-grow-1" style={{ overflowY: 'auto' }}>
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      <div
        className={`position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none ${
          isSidebarOpen ? 'd-block' : 'd-none'
        }`}
        style={{ zIndex: 1 }}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
    </div>
  );
}