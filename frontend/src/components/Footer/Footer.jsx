import React from "react";
import logo from "../../assets/Screenshot 2024-11-24 190925.png";

const Footer = () => {
  return (
    <div className='h-10 w-screen  flex justify-between items-center bg-green-500'>
      <div className='flex gap-4 text-white text-lg font-normal ml-8'>
        <div>Cam Dam Dam</div>
        <div>Legal</div>
        <div>Privacy</div>
      </div>
      <div className='flex gap-4 text-white text-xl font-normal'>
        <img src={logo} className='h-8 mr-8' />
      </div>
    </div>
  );
};

export default Footer;
