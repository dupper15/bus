import React from 'react';
import useSignUpViewModel from "@/pages/SignUpPage/SignUpViewModel.js";

const SignUpPage = () => {
    const {
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
    } = useSignUpViewModel();

    return (<div className='bg-white h-screen w-screen flex'>
        <div className='bg-[#4CAF50] basis-1/3 h-full flex justify-center pt-24'>
            <div className='text-white font-bold text-4xl text-center'>
                <p className='mb-4'>Your journey,</p>
                <p>simplified</p>
            </div>
        </div>

        <div className='bg-white basis-2/3 h-full flex flex-col justify-center items-center gap-4'>
            <form className='w-[50%] flex flex-col gap-6' onSubmit={handleSubmit}>
                <div className='text-black font-bold text-4xl text-center'>
                    Create account
                </div>
                <input
                    type='text'
                    placeholder='Full Name'
                    value={name}
                    onChange={handleNameChange}
                    className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'
                />
                <input
                    type={'text'}
                    placeholder='Number Phone'
                    value={phone}
                    onChange={handlePhoneChange}
                    className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'
                />
                <p>Debug: nhập 12 ký tự</p>
                <input
                    //Change type to email
                    type={'text'}
                    // type='email'
                    placeholder='Email'
                    value={email}
                    onChange={handleEmailChange}
                    className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'
                />
                <input
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={handlePasswordChange}
                    className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'
                />
                <input
                    type='password'
                    placeholder='Confirm Password'
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'
                />
                <button
                    type='submit'
                    className='bg-[#4CAF50] h-10 w-full rounded-md hover:bg-[#8ce58f] text-white font-bold text-sm'
                >
                    Sign up
                </button>
                {error && <div className='text-red-500'>{error}</div>}
                <div className='text-sm text-gray-600'>
                    Already have an account?{' '}
                    <a
                        className='text-[#0A74DA] font-semibold hover:cursor-pointer'
                        href='/login'
                    >
                        Login
                    </a>
                </div>
            </form>
        </div>
    </div>);
};

export default SignUpPage;