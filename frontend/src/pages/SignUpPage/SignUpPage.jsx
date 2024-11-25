import React from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const navigate = useNavigate();
  return (
    <div className='bg-white h-screen w-screen flex'>
      <div className='bg-[#4CAF50] basis-1/3 h-full flex justify-center pt-24'>
        <div className='text-white font-bold text-4xl text-center'>
          <p className='mb-4'>Your journey,</p>
          <p>simplified</p>
        </div>
      </div>

      <div className='bg-white basis-2/3 h-full flex flex-col justify-center items-center gap-4'>
        <form className='w-[50%] flex flex-col gap-6'>
          <div className='text-black font-bold text-4xl text-center'>
            Create account
          </div>
          <input
            type='text'
            placeholder='Full Name'
            className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'></input>
          <input
            type='number'
            placeholder='Number Phone'
            className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'></input>
          <input
            type='email'
            placeholder='Email'
            className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'></input>
          <input
            type='password'
            placeholder='Password'
            className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'></input>
          <input
            type='password'
            placeholder='Confirm Password'
            className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'></input>
          <button
            onClick={() => {
              navigate("/home");
            }}
            type='submit'
            className='bg-[#4CAF50] h-10 w-full rounded-md hover:bg-[#8ce58f] text-white font-bold text-sm'>
            Sign up
          </button>
          <div className='text-sm text-gray-600'>
            Already have an account?{" "}
            <a
              className='text-[#0A74DA] font-semibold hover:cursor-pointer'
              href='/login'>
              Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
