import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useMutation } from "react-query";
import { jwtDecode } from 'jwt-decode';
import * as Account from "../../services/accountService";
import * as Message from "../../components/ui/alert";
import { updateAccount } from '@/redux/accountSlide';


const SignInPage = () => {
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGetDetailAccount = async (id, token) => {
    const res = await Account.getDetailAccount(id, token)
    dispatch(updateAccount({...res?.data, access_token: token}))
  }

  const mutationLogin = useMutation({
    mutationFn: async ({data}) => {
      return await Account.loginAccount(data)
    },
    onSuccess: (data) => {
      console.log(data) 
        Message.success(data.message)
        localStorage.setItem('access_token', JSON.stringify(data?.access_token))
        if(data?.access_token) {
          const decoded = jwtDecode(data?.access_token)
          if (decoded?.id){
            handleGetDetailAccount(decoded?.id, data?.access_token)
          }
        }
        if (data.userType === "Customer"){
          navigate('/home');
        } else if (data.userType === "Employee"){
          navigate('/employee');
        } else if (data.userType === "Manager"){
          navigate('/manage')
        } else if (data.userType === "Admin") {
          navigate('/admin')
        } 
    },
    onError: (error) => {
      console.log(error)
    }
  })

  const onLogin = (e) => {
    e.preventDefault();
    const values = {
      username: username,
      password: password
    }
    mutationLogin.mutate({data: values})
  }
  
  return (
    <div className="bg-white h-screen w-screen flex">
      <div className="bg-[#4CAF50] basis-1/3 h-full flex justify-center pt-40">
        <div className="text-white font-bold text-4xl text-center">
          <p className="mb-4">Your journey,</p>
          <p>simplified</p>
        </div>
      </div>

      <div className="bg-white basis-2/3 h-full flex flex-col justify-center items-center gap-4">
        <form className="w-[50%] flex flex-col gap-6" onSubmit={onLogin}>
          <div className="text-black font-bold text-4xl text-center">
            Sign in
          </div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value) }
            className="w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2"
          />
          <div className="text-sm text-gray-600">
            I forgot my password. Click{" "}
            <a className="text-[#0A74DA] font-semibold hover:cursor-pointer">
              here
            </a>{" "}
            to reset
          </div>
          <button
            type="submit"
            className="bg-[#4CAF50] h-10 w-full rounded-md hover:bg-[#8ce58f] text-white font-bold text-sm">
            Log in
          </button>
        </form>
        <div className="w-[50%] h-[1px] bg-slate-400"></div>
        <button
          type="button"
          onClick={() => {
            navigate("/signup");
          }}
          className="bg-[#0A74DA] h-10 w-[50%] rounded-md hover:bg-[#5dacf7] text-white font-bold text-sm">
          Sign up
        </button>
      </div>
    </div>
  );
};

export default SignInPage;
