import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useProfileViewModel = () => {
    const [profile, setProfile] = useState({
        name: '',
        image: '',
        id_card: '',
        phone: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const cachedProfile = localStorage.getItem('profile');
                if (cachedProfile) {
                    setProfile(JSON.parse(cachedProfile));
                    setLoading(false);
                } else {
                    const response = await axios.get(`/api/customer/get-detail/${localStorage.getItem("userId")}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    });
                    setProfile(response.data);
                    localStorage.setItem('profile', JSON.stringify(response.data));
                    console.log(response.data);
                }
            } catch (e) {
                setError('Failed to fetch profile data.');
                console.log(e);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile().then().catch();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/customer/profile', profile, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            localStorage.setItem('profile', JSON.stringify(profile));
            alert('Profile updated successfully.');
        } catch (e) {
            setError('Failed to update profile.');
            console.log(e);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('profile');
        navigate('/login');
    };

    return {
        profile,
        loading,
        error,
        handleInputChange,
        handleSubmit,
        handleLogout
    };
};

export default useProfileViewModel;