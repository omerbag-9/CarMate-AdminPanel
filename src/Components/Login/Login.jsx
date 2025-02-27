import axios from 'axios'
import { useFormik } from 'formik'
import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import Cookies from 'js-cookie'
import { UserContext } from '../../Context/UserContext'


export default function Login() {
  let [isLoading, setIsloading] = useState(false)
  let [errMsg, setErrMsg] = useState('')
  let {userToken ,setUserToken} = useContext(UserContext)
  let {role , setRole} = useContext(UserContext)
  let navigate = useNavigate()

  const validationSchema = yup.object({
    email: yup.string().required('email is required').email('email is invalid').lowercase(),
    password: yup.string().required('password is required')
  })
  
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit:loginSubmit
  })

  async function loginSubmit(values){
    setIsloading(true)
    let {data} = await axios.post('https://fb-m90x.onrender.com/admin/login/admin/145461456',values).catch((err)=>{
      setErrMsg(err.message)
      setIsloading(false)
    })
    if(data.status == 'login successfully'){
      setIsloading(false)
      Cookies.set('token',data.data.token)
      Cookies.set('role',data.data.role)
      setUserToken(data.data.token)
      setRole(data.data.role)    
      navigate('/')
    }
    

  }

  return (
    <div className='d-flex justify-content-center align-items-center position-fixed start-0 top-0 end-0 bottom-0 login-background z-3'>
        <div className="overlay position-absolute start-0 top-0 end-0 bottom-0  "></div>

        <div className=" m-auto bg-white p-5 rounded z-3">
            <h3 className='text-center text-black'>Login to Account</h3>
            <p className='text-center mb-4 text-muted'>Please enter your email and password to continue</p>
            {errMsg ? <div className="alert alert-danger p-1">{errMsg}</div> : ''}
            <form className='' action="" onSubmit={formik.handleSubmit}>
                <div className="">
                <label className='float-start mb-3 text-black' htmlFor="email">Email address:</label>
                <input className='form-control mb-2' type="email" id='email' name='email' placeholder='esteban_schiller@gmail.com' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.email} />
                {formik.touched.email && formik.errors.email ? <div className="alert alert-danger p-1">{formik.errors.email}</div> : ''}
                </div>


                <div className="d-flex justify-content-between align-items-center mb-3  ">
                <label className='text-black' htmlFor="password">Password:</label>
                <Link to={'#'} className='text-secondary'>Forget Password?</Link>
                </div>
                <input className='form-control mb-2' type="password" id='password' name='password' placeholder='*********' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.password} />
                {formik.touched.password && formik.errors.password ? <div className="alert alert-danger p-1 mt-2">{formik.errors.password}</div> : ''}

                {isLoading ? <button disabled={!(formik.isValid && formik.dirty)} type='button' className='btn btn-primary w-100 my-3' >Loading...</button> 
                :
                <button type='submit' className='btn btn-primary w-100 my-3'>
                    Sign In
                </button>
                }
            </form>
        </div>
    </div>
  )
}
