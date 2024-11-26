import {useMutation} from 'react-query';
import {useNavigate} from 'react-router-dom';
import {jwtDecode} from "jwt-decode";
import {getUserDetails, loginUser} from "@/services/userService.js";

const useSignInMutation = (request, navigatePath) => {
    const navigate = useNavigate();

    return useMutation(
        async ({ id_card, password }) => {
            return await loginUser({id_card, password});
        },
        {
            onSuccess: (data) => {
                const decodedToken = jwtDecode(data.access_token);
                localStorage.setItem('access_token', JSON.stringify(data.access_token));
                localStorage.setItem('active_user_id', decodedToken.id);
                getUserDetails(decodedToken.payload.id, data.access_token).then((response) => {
                    localStorage.setItem('active_user', JSON.stringify(response));
                    console.log(response);
                });
                navigate(navigatePath);
            },
            onError: () => {
                alert('Invalid username or password!');
            }
        }
    );
};

export default useSignInMutation;