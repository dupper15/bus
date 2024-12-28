import React from "react";
import image from "../../assets/image 2.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TicketFare = () => {
  const navigate = useNavigate();
  return (
    <div className='w-full flex h-full p-6 bg-white'>
      {/* Left Section */}
      <div className='basis-1/2 flex flex-col pl-8 gap-6'>
        {/* Title */}
        <div className='font-bold text-4xl text-green-500 mt-4'>
          Fares and Tickets
        </div>
        {/* Subtitle */}
        <div className='font-semibold text-2xl text-green-500'>
          Your One-Stop Ticket to the City
        </div>
        {/* Description */}
        <div className='font-normal text-lg text-gray-700'>
          Experience hassle-free travel with our convenient ticketing system,
          designed to make your journey smooth and enjoyable.
        </div>
        {/* Offerings Title */}
        <div className='font-semibold text-2xl text-green-500'>
          Our Offerings:
        </div>
        {/* Ticket Card */}
        <div className='w-full  border-2 border-gray-300 shadow-lg rounded-lg p-6 flex flex-col gap-4 items-center'>
          <div className='font-semibold text-2xl text-green-500'>
            Monthly Ticket
          </div>
          <div className='font-bold text-5xl text-gray-800'>$30</div>
          <div className='font-normal text-lg text-gray-600'>
            Validity: 30 days
          </div>
          <div className='font-normal text-lg text-gray-600'>
            Usage: Valid on all bus routes
          </div>
          <div className='font-normal text-lg text-gray-600'>
            Locale: Ho Chi Minh City
          </div>
          <button
            onClick={() => navigate("/payment")}
            className='bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-8 rounded-md transition'>
            Buy Now
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div
        className='basis-1/2 mt-4 mb-2 ml-6 rounded-lg shadow-lg'
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}></div>
    </div>
  );
};

export default TicketFare;
