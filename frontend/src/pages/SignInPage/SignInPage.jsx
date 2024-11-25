import useSignInViewModel from './SignInViewModel';

const SignInPage = () => {
    const {
        username,
        password,
        handleUsernameChange,
        handlePasswordChange,
        handleSubmit,
        handleNavigate,
    } = useSignInViewModel();

    return (
        <div className='bg-white h-screen w-screen flex'>
            <div className='bg-[#4CAF50] basis-1/3 h-full flex justify-center pt-40'>
                <div className='text-white font-bold text-4xl text-center'>
                    <p className='mb-4'>Your journey,</p>
                    <p>simplified</p>
                </div>
            </div>

            <div className='bg-white basis-2/3 h-full flex flex-col justify-center items-center gap-4'>
                <form className='w-[50%] flex flex-col gap-6' onSubmit={handleSubmit}>
                    <div className='text-black font-bold text-4xl text-center'>
                        Sign in
                    </div>
                    <input
                        type='text'
                        placeholder='Username'
                        value={username}
                        onChange={handleUsernameChange}
                        className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'
                    />
                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={handlePasswordChange}
                        className='w-full rounded-md border-2 border-slate-300 focus:border-[#4CAF50] outline-none p-2'
                    />
                    <div className='text-sm text-gray-600'>
                        I forgot my password. Click{' '}
                        <a className='text-[#0A74DA] font-semibold hover:cursor-pointer'>
                            here
                        </a>{' '}
                        to reset
                    </div>
                    <button
                        type='submit'
                        className='bg-[#4CAF50] h-10 w-full rounded-md hover:bg-[#8ce58f] text-white font-bold text-sm'
                    >
                        Log in
                    </button>
                </form>
                <div className='w-[50%] h-[1px] bg-slate-400'></div>
                <button
                    type='button'
                    onClick={() => {
                        handleNavigate('/signup');
                    }}
                    className='bg-[#0A74DA] h-10 w-[50%] rounded-md hover:bg-[#5dacf7] text-white font-bold text-sm'
                >
                    Sign up
                </button>
            </div>
        </div>
    );
};

export default SignInPage;