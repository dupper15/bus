import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import TicketFare from "./TicketFare";
import BusRoute from "./BusRoute";
import ProfilePage from "../ProfilePage/ProfilePage.jsx";
import { FaBus } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { CiMap } from "react-icons/ci";

const MainPage = () => {
  return (
    <div>
      <div className='flex h-screen'>
        <div className='h-screen basis-1/6 flex flex-col items-start p-10 gap-2 text-[#4CAF50]'>
          <h2 className='text-2xl font-bold'>Your</h2>
          <h2 className='text-2xl font-bold'>Public</h2>
          <h2 className='text-2xl font-bold mb-4'>Transport</h2>
          <Link to='/home'>
            <div className='w-2/3 aspect-square rounded-full bg-[#4CAF50] flex items-center justify-center'>
              <FaBus className='text-white text-5xl' />
            </div>
            <span className='text-slate-600 font-normal'>Fares & Tickets</span>
          </Link>
          <Link to='busroute'>
            <div className='w-2/3 aspect-square rounded-full bg-[#4CAF50] flex items-center justify-center'>
              <CiMap className='text-white text-5xl' />
            </div>
            <span className='text-slate-600 font-normal'>Bus Routes</span>
          </Link>
          <Link to='info'>
            <CgProfile className='text-white text-8xl w-2/3 bg-[#4CAF50] rounded-full aspect-square h-20' />
            <span className='text-slate-600 font-normal'>Profile</span>
          </Link>
        </div>
        <div className='h-screen basis-5/6'>
          <Routes>
            <Route index element={<TicketFare />} />
            <Route path='busroute' element={<BusRoute />} />
            <Route path='info' element={<ProfilePage />} />
          </Routes>
        </div>
      </div>
      <footer></footer>
    </div>
  );
};

export default MainPage;
