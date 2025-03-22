import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Components/Layout/Layout'
import Home from './Components/Home/Home'
import Login from './Components/Login/Login'
import Notfound from './Components/Notfound/Notfound'
import User from './Components/User/User'
import Seller from './Components/Seller/Seller'
import Worker from './Components/Worker/Worker'
import Product from './Components/Product/Product'
import AddUser from './Components/AddUser/AddUser'
import AddProduct from './Components/AddProduct/AddProduct'
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute'
import MyProducts from './Components/MyProducts/MyProducts'
import SpecificUser from './Components/SpecificUser/SpecificUser'
import SpecificWorker from './Components/SpecificWorker/SpecificWorker'
import AddWorker from './Components/AddWorker/AddWorker'
import Category from './Components/Category/Category'
import GetSpecificProduct from './Components/GetSpecificProduct/GetSpecificProduct'


let routers = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { path: '/', element: <ProtectedRoute><Home /></ProtectedRoute> },
      { path: 'users', element: <ProtectedRoute><User /></ProtectedRoute> },
      { path: 'workers', element: <ProtectedRoute><Worker /></ProtectedRoute> },
      { path: 'sellers', element: <ProtectedRoute><Seller /></ProtectedRoute> },
      { path: 'products', element: <ProtectedRoute><Product /></ProtectedRoute> },
      { path: 'myproducts', element: <ProtectedRoute><MyProducts /></ProtectedRoute> },
      { path: 'add-user', element: <ProtectedRoute><AddUser /></ProtectedRoute> },
      { path: '/seller/add-product', element: <ProtectedRoute><AddProduct /></ProtectedRoute> },
      { path: 'Category', element: <ProtectedRoute><Category /></ProtectedRoute> },
      {path:'specific-user/:id',element:<ProtectedRoute><SpecificUser/></ProtectedRoute>},
      {path:'specific-worker/:id',element:<ProtectedRoute><SpecificWorker/></ProtectedRoute>},
      {path:'/seller/getSpecificProduct/:id',element:<ProtectedRoute><GetSpecificProduct/></ProtectedRoute>},
      {path:'add-worker',element:<ProtectedRoute><AddWorker/></ProtectedRoute>},
    ]
  },
  {
    path: '*',
    element: <Notfound />
  }
]);
function App() {

  return (
    <>
      <RouterProvider router={routers}></RouterProvider>
    </>
  )
}

export default App
