import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpUser } from '@/services/userService.js';

const useSignUpViewModel = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleNameChange = (e) => setName(e.target.value);
    const handlePhoneChange = (e) => setPhone(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            // Change email to id_card, add email
            const response = await signUpUser({ name, phone, id_card: email, password, confirmPassword });
            if (response.status === 'OK') {
                navigate('/login');
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError('An error occurred during sign up');
            console.error(error);
        }
    };

    return {
        name,
        phone,
        email,
        password,
        confirmPassword,
        error,
        handleNameChange,
        handlePhoneChange,
        handleEmailChange,
        handlePasswordChange,
        handleConfirmPasswordChange,
        handleSubmit
    };
};

export default useSignUpViewModel;