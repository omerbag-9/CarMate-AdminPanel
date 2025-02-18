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


let routers = createBrowserRouter([
  {path:'/' , element: <Layout/> ,children:[
    {path:'/' , element: <Home/>,children:[
      {path:'users' , element:<User/>},
      {path:'workers' , element:<Worker/>},
      {path:'sellers' , element:<Seller/>},
      {path:'products' , element:<Product/>},
      {path:'add-user' , element:<AddUser/>},
      {path:'add-product' , element:<AddProduct/>},
    ]},
    {path:'login' , element: <Login/>},
    {path:'*' , element: <Notfound/>}
  ]}

])
function App() {

  return (
    <>
      <RouterProvider router={routers}></RouterProvider>
    </>
  )
}

export default App
