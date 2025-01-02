import React, { useEffect } from "react";
import traiTim from "../../assets/traiTim.png";
import usePurchasePagesViewModel from "./PurchasePagesViewModel";

const Thanks = ({ nextStep }) => {
  const { purchaseData } = usePurchasePagesViewModel();
  useEffect(() => {
    nextStep();
    console.log("alo")
  },);
  return (
    <div className='flex flex-col items-center  h-max bg-white text-green-500 px-6'>
      {/* Icon cảm ơn */}
      <div className='mb-6'>
        <img
          src={traiTim}
          alt='Thank you'
          className='w-28 h-28 md:w-36 md:h-36'
        />
      </div>

      {/* Tiêu đề cảm ơn */}
      <h1 className='text-3xl md:text-4xl font-extrabold text-center mb-4'>
        Thank You for Your Purchase!
      </h1>

      {/* Sản phẩm đã mua */}
      <h2 className='text-xl md:text-2xl font-semibold text-center mb-6'>
        You’ve successfully purchased the {purchaseData.product}.
      </h2>

      {/* Mô tả chi tiết */}
      <p className='text-center text-gray-700 text-lg leading-relaxed mb-8'>
        You’re all set! An email with your order details has been sent to your
        inbox.
        <br />
        We’re excited to have you on board!
      </p>

      {/* Nút quay lại trang chủ */}
      <button
        className='px-8 py-3 mb-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all'
        onClick={() => (window.location.href = "/home")}>
        Back to Homepage
      </button>
    </div>
  );
};

export default Thanks;
