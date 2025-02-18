import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SideNav from '../SideNav/SideNav'

export default function Layout() {

  return (
    <>
    <div className="background">
    <Outlet/>
    </div>
    </>
  )
}