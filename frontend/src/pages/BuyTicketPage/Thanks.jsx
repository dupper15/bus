import React from 'react';
import traiTim from '../../assets/traiTim.png';
import usePurchasePagesViewModel from './PurchasePagesViewModel';

const Thanks = () => {
    const { purchaseData } = usePurchasePagesViewModel();

    return (
        <div className='flex flex-col items-center justify-start h-min text-[#4CAF50]'>
            <div className='mb-4'>
                <img src={traiTim} alt="Thank you" />
            </div>
            <h1 className='text-2xl md:text-3xl font-bold text-center mb-2'>
                Thank you for purchasing the <br /> {purchaseData.product}
            </h1>
            <p className='text-center text-black mb-8'>
                You&#39;re all set! You&#39;ll receive an email with your order details.
                <br />
                We look forward to having you on board!
            </p>
            <button
                className='px-6 py-2 mb-2 bg-[#4CAF50] text-white font-medium rounded hover:bg-[#6bdb6f]'
                onClick={() => (window.location.href = '/home')}>
                Back To Homepage
            </button>
        </div>
    );
};

export default Thanks;