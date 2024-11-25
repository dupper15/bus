import React from "react";
import notfound from "../../assets/404.jpg";
import { useNavigate } from "react-router-dom";

const Page404 = () => {
  const navigate = useNavigate();
  return (
    <div className='h-screen w-screen flex flex-col justify-center items-center gap-8'>
      <img src={notfound} alt='404' />
      <button
        onClick={() => {
          navigate("/");
        }}
        className='bg-[#4CAF50] hover:bg-[#8ce58f] text-white font-bold py-2 px-6 rounded-md'>
        Return now
      </button>
    </div>
  );
};

export default Page404;
