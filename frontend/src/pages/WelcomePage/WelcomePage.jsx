import React from 'react';
import background from '../../assets/Group 69.png';
import { Button } from "@/components/ui/button"

const WelcomePage = () => {
    return (
        <div
            className="h-screen bg-cover bg-center flex flex-col items-center justify-center gap-8"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className='text-[#4CAF50] font-bold text-5xl'>BusMap</div>
            <div className='text-white font-bold text-6xl'>Transportation made simple</div>
            <div className='text-white font-light text-3xl'>Explore new destinations and create unforgettable memories.</div>
            <Button size = "lg">Get Started</Button>
        </div>
    );
};

export default WelcomePage;
