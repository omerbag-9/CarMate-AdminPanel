import React from 'react'
import { Outlet } from 'react-router-dom'
import SideNav from '../SideNav/SideNav'
import Header from '../Header/Header'

export default function Home() {
  return (
    <div className=" p-0">
      <div className="row g-0">
        <div className="col-2">
          <SideNav />
        </div>
        <div className="col-10">
          <Header />
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}