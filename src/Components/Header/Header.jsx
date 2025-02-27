import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../Context/UserContext';
import Loader from '../Loader/Loader';

export default function Header() {
        const { getProfile } = useContext(UserContext);
        const [profile, setProfile] = useState({});
        let [loading, setLoading] = useState(false);
    
        async function getUserProfile() {
            setLoading(true);
            let data = await getProfile();
            setProfile(data.data);
            setLoading(false);
        }
    
        // Call the fetch function inside useEffect
        useEffect(() => {
            getUserProfile();
        }, []);

    return (
        <>
        {loading ? <Loader/>:<> 
        
            <div className="">
               <h2 className='text-white text-start ms-5 py-3'>Hello, {profile.firstName}👋</h2>
                <span className='header-hr d-block'></span>
            </div>
        </>}
        </>
    );
}
