import axios from 'axios';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import Cookies from 'js-cookie';

export default function Category() {
    let [errMsg, setErrMsg] = useState('');
    let [isLoading, setIsLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            name: ''
        },
        onSubmit: addCategory
    });

    async function addCategory(values) {
        setIsLoading(true);
        try {
            let { data } = await axios.post(
                'https://fb-m90x.onrender.com/admin/addcategory',
                values, {
                    headers: { token: Cookies.get('token') }
                }
            );

            if (data.status === 'category created successfully') {
                console.log(data);
                formik.resetForm(); // تصفير الحقل بعد الإضافة
            }
        } catch (err) {
            setErrMsg(err.message);
            console.log(err.message);
            
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <h2 className="my-5 text-white">Category</h2>
            {errMsg && <div className="alert alert-danger p-1 w-50 mx-auto">{errMsg}</div>}
            <form className="d-flex justify-content-center" onSubmit={formik.handleSubmit}>
                <input
                    className="form-control me-2 w-50 py-2"
                    placeholder="Add category"
                    type="text"
                    id="name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                />
                {isLoading ? (
                    <button type="button" className="btn btn-primary px-5 py-2" disabled>
                        Loading...
                    </button>
                ) : (
                    <button className="btn btn-primary px-5 py-2" type="submit">
                        Add
                    </button>
                )}
            </form>
        </>
    );
}
