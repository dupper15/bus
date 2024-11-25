import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import useSignInMutation from "@/hooks/useSignInMutation.js";

const useSignInViewModel = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const mutation = useSignInMutation('http://localhost:3001/api/customer/log-in', '/home');

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({id_card: username, password: password});
    };

    const handleNavigate = () => {
        navigate('/signup');
    };

    return {
        username,
        password,
        handleUsernameChange,
        handlePasswordChange,
        handleSubmit,
        handleNavigate
    };
};

export default useSignInViewModel;