import { useMutation } from 'react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useSignInMutation = (request, navigatePath) => {
    const navigate = useNavigate();

    return useMutation(
        async ({ id_card, password }) => {
            const response = await axios.post(request, {
                id_card,
                password
            });
            return response.data;
        },
        {
            onSuccess: (data) => {
                localStorage.setItem('accessToken', data.accessToken);
                navigate(navigatePath);
            },
            onError: () => {
                alert('Invalid username or password!');
            }
        }
    );
};

export default useSignInMutation;