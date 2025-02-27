import axios from "axios";
import { createContext, useState } from "react";
import Cookies from 'js-cookie';

export let UserContext = createContext();

export default function UserContextProvider({ children }) {
    const [userToken, setUserToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(false);

    async function getProfile() {
        try {
            const response = await axios.get('https://fb-m90x.onrender.com/user/myprofile', {
                headers: {
                    'token': Cookies.get('token')
                }
            });
            return response.data;  // ✅ No need to call setLoading(false) here
        } catch (err) {
            console.error('Error fetching profile:', err);
            throw err;
        }
    }

    return (
        <UserContext.Provider value={{ userToken, setUserToken, role, setRole, getProfile, loading, setLoading }}>
            {children}
        </UserContext.Provider>
    );
}
