import React, { useEffect, useRef, useState } from "react";
import visa from "../../assets/image 8.png";
import { Link, useNavigate } from "react-router-dom";
import usePurchasePagesViewModel from "./PurchasePagesViewModel";
import * as TicketService from "@/services/ticketService";
import * as Message from "@/components/ui/alert";
import { useMutation } from "react-query";
import { useSelector } from "react-redux";
import axios from "axios";

const Purchase = ({ prevStep }) => {
  const navigate = useNavigate();
  const account = useSelector((state) => state.account);
  useEffect(() => {
    prevStep();
  });
  const [selectedLine, setSelectedLine] = useState("Line 1");
  const [content, setContent] = useState("");
  const date = new Date().toISOString();

  const selectedLineRef = useRef(selectedLine);
  const contentRef = useRef(date + selectedLineRef.current);

  const MY_BANK = "MB";
  const ACCOUNT_NO = "0948041545";
  const ACCOUNT_NAME = "CAO DUONG LAM";
  const price = 10000;

  useEffect(() => {
    // Cập nhật selectedLineRef ngay lập tức
    selectedLineRef.current = selectedLine;
    contentRef.current = date + selectedLineRef.current;
  }, [selectedLine]);
  useEffect(() => {
    // Cập nhật content mỗi khi selectedLine thay đổi
    setContent(date.replace(/[-:.\s]/g, "") + selectedLine.replace(/\s/g, ""));
  }, [selectedLine]);
  const checkPaid = async () => {
    try {
      const response = await axios.get(
        "https://script.googleusercontent.com/macros/echo?user_content_key=1arkNjhD8BvBTKwRWk2wAxMXZeihNMn6ZszcG8obyaYSTG3t8vprpDUO6YgFznOq0v2ILdbwI34laxHjt9LtzNGkTSW3OOJEm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnG8wA_srPnc6MBl2lEpm0VdZ3CX-sQi0hZ90X1RW5jikAGB2oH9IU6b9wxAeSFEnTgO9bqOAr_UnVt9qHG2oIwX1w6oFCY34T9z9Jw9Md8uu&lib=M-t7YJKp6uv0DvKyaUi6SixfZynQPYsQn"
      );
      const data = await response.data.data;
      const lastPaid = data[data.length - 1];
      const check = contentRef.current.replace(/[-:.\s]/g, "");
      const lastPrice = lastPaid["Giá trị"];
      const lastContent = lastPaid["Mô tả"];
      if (lastPrice >= price && lastContent.includes(check)) {
        const data = await TicketService.createTicket({
          line: selectedLineRef.current,
          price: price,
          customer: account._id,
        });
        if (data.status === "OK") {
          Message.success(data.message);
          nextStep();
          navigate("/payment/thanks");
        } else {
          Message.error(data.message);
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error("Failed to check paid", error);
      throw error;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkPaid(); // Gọi hàm không truyền selectedLine, sử dụng giá trị từ ref.
    }, 3000);
    return () => clearInterval(interval); // Xóa interval khi component bị unmount.
  }, []); // Chỉ chạy một lần khi component mount.

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow -mt-8 text-black text-3xl font-bold text-center py-4 border-b border-gray-200'>
        Order Checkout
      </div>

      {/* Main Content */}
      <div className='flex flex-col md:flex-row gap-8 p-6 md:p-10'>
        {/* Product Details */}
        <div className='flex flex-col flex-1 border border-slate-200 bg-white shadow-md rounded-lg p-6'>
          <div className='text-black font-semibold text-2xl mb-4'>Product</div>
          <div className='text-black text-xl font-semibold'>
            Bus Pass
            <span className='font-normal text-lg text-gray-600'>
              {" "}
              - Monthly Subscription
            </span>
          </div>
          <div className='text-gray-600 text-base mt-2'>
            Valid for 1 month from order delivery date.
          </div>
        </div>

        {/* Order Summary */}
        <div className='flex flex-col flex-1 border border-slate-200 bg-white shadow-md rounded-lg p-6'>
          <div className='text-black font-semibold text-2xl mb-4'>
            Order Summary
          </div>
          <table className='w-full mb-6 text-left border-collapse'>
            <thead>
              <tr className='text-gray-600 text-sm'>
                <th className='font-medium'>Item Price</th>
                <th className='font-medium'>Quantity</th>
                <th className='font-medium'>Extended Price</th>
              </tr>
            </thead>
            <tbody>
              <tr className='text-center text-gray-800'>
                <td>
                  US $30.00
                  <br />
                  <span className='text-xs text-gray-500'>/month</span>
                </td>
                <td>1</td>
                <td>US $30.00</td>
              </tr>
            </tbody>
          </table>
          <table className='w-full text-right'>
            <tbody>
              <tr>
                <td className='pr-6 text-gray-700'>Total</td>
                <td className='pl-4 text-black'>US $30</td>
              </tr>
              <tr>
                <td className='pr-6 text-gray-700'>Tax (0%)</td>
                <td className='pl-4 text-black'>US $0</td>
              </tr>
              <tr className='border-t border-gray-300'>
                <td className='pr-6 font-bold text-gray-800'>Grand Total</td>
                <td className='pl-4 font-bold text-black'>US $30</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code and Selection */}
      <div className='flex flex-col items-center bg-white shadow-md rounded-lg mx-6 md:mx-10 p-6'>
        <div className='flex items-center gap-4 mb-4'>
          <label className='text-gray-700 text-sm font-medium'>Time:</label>
          <select
            onChange={(e) => setSelectedLine(e.target.value)}
            value={selectedLine}
            className='border border-gray-300 rounded-lg px-3 py-2 text-gray-700'>
            <option value='Line 1'>Line 1</option>
            <option value='Line 2'>Line 2</option>
            <option value='Line 3'>Line 3</option>
          </select>
        </div>
        <div className='text-gray-700 text-sm font-medium mb-2'>
          Scan the QR Code to complete payment:
        </div>
        <img
          key={content}
          src={`https://img.vietqr.io/image/${MY_BANK}-${ACCOUNT_NO}-compact2.png?amount=${price}&addInfo=${content}&accountName=${ACCOUNT_NAME}`}
          alt='QR Code'
          className='w-48 h-48'
        />
      </div>

      {/* Footer Buttons */}
      <div className='flex justify-center gap-4 bg-white py-6 shadow-inner'>
        <button
          onClick={() => (window.location.href = "/home")}
          className='bg-gray-500 hover:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-all'>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Purchase;
