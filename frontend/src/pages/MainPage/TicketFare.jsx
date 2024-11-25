import React from "react";
import image from "../../assets/image 2.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TicketFare = () => {
  const navigate = useNavigate();
  return (
    <div className='w-6/7 flex h-full'>
      <div className='basis-1/2 flex flex-col gap-4'>
        <div className='font-bold text-4xl text-[#4CAF50] mt-7 mb-3'>
          Fares and Tickets
        </div>
        <div className='font-semibold text-2xl text-[#4CAF50]'>
          Your One-Stop Ticket to the City
        </div>
        <div className='font-normal text-xl text-black'>
          Experience hassle-free travel with our convenient ticket{" "}
        </div>
        <div className='font-semibold text-2xl text-[#4CAF50]'>
          Our Offerings:
        </div>
        <div className='h-max w-max p-4 ml-auto mr-20 border-2 border-black flex flex-col gap-3 items-center justify-center'>
          <div className='font-semibold text-2xl text-[#4CAF50]'>
            Monthly Ticket
          </div>
          <div className='font-bold text-5xl text-black'>$30</div>
          <div className='font-normal text-xl text-black'>
            Validity: 30 days
          </div>
          <div className='font-normal text-xl text-black'>
            Usage: Valid on all bus routes
          </div>
          <div className='font-normal text-xl text-black'>
            Locale: Ho Chi Minh city
          </div>
          <button
            onClick={() => {
              navigate("/payment");
            }}
            className='bg-[#4CAF50] hover:bg-[#8ce58f] text-white font-bold py-2 px-6 rounded-md'>
            Buy Now
          </button>
        </div>
      </div>
      <div
        className='basis-1/2 mt-7 mb-4 mr-8 '
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}></div>
    </div>
  );
};

export default TicketFare;
