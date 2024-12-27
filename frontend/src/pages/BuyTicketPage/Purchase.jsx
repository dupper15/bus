import React, { useEffect, useRef, useState } from 'react';
import visa from "../../assets/image 8.png";
import { Link, useNavigate } from "react-router-dom";
import usePurchasePagesViewModel from "./PurchasePagesViewModel";
import * as TicketService from "@/services/ticketService";
import * as Message from "@/components/ui/alert"
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Purchase = ({ nextStep }) => {
  
  const navigate = useNavigate();
  const account = useSelector((state) => state.account);
    
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
      const response = await axios.get("https://script.googleusercontent.com/macros/echo?user_content_key=1arkNjhD8BvBTKwRWk2wAxMXZeihNMn6ZszcG8obyaYSTG3t8vprpDUO6YgFznOq0v2ILdbwI34laxHjt9LtzNGkTSW3OOJEm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnG8wA_srPnc6MBl2lEpm0VdZ3CX-sQi0hZ90X1RW5jikAGB2oH9IU6b9wxAeSFEnTgO9bqOAr_UnVt9qHG2oIwX1w6oFCY34T9z9Jw9Md8uu&lib=M-t7YJKp6uv0DvKyaUi6SixfZynQPYsQn")
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
      <div className='flex flex-col'>
        <div className='text-black text-4xl font-bold ml-4 mb-8'>
          Order Checkout
        </div>
        <div className='flex flex-col'>
          <div className='border border-gray-400 flex ml-32 mr-20'>
            <div className=' flex flex-col basis-1/2 pt-4 pl-4'>
              <div className='text-black font-semibold text-4xl'>Product</div>
              <div className='text-black text-2xl font-semibold mt-4'>
                Bus Pass{" "}
                <span className='text-black text-2xl font-normal mt-8'>
                - monthly subscription
              </span>
              </div>
              <div className='text-black text-xl font-normal  mt-2'>
                valid for 1 month from order delivery date
              </div>
            </div>
            <div className='basis-1/2'>
              <table className='w-full'>
                <thead>
                <tr>
                  <th>Item Price</th>
                  <th>Quantity</th>
                  <th>Extended Price</th>
                </tr>
                </thead>
                <tbody>
                <tr className='text-center'>
                  <td>
                    US $30.00
                    <br />
                    <span className='text-xs'>/month</span>
                  </td>
                  <td>1</td>
                  <td>US $30.00</td>
                </tr>
                </tbody>
              </table>
              <table className='border-l border-t border-gray-400 h-1/2 w-full mr-0 ml-auto mb-0 mt-auto'>
                <tbody>
                <tr>
                  <td className='pr-20' align='right'>
                    Total
                  </td>
                  <td className='pl-10' align='left'>
                    US $30
                  </td>
                </tr>
                <tr>
                  <td className='pr-20' align='right'>
                    Tax (0%)
                  </td>
                  <td className='pl-10' align='left'>
                    US $0
                  </td>
                </tr>
                <tr>
                  <td className='pr-20' align='right'>
                    Grand Total
                  </td>
                  <td className='pl-10' align='left'>
                    US $30
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-center items-center h-screen">
            <div className="flex items-center gap-2 basis-1/5">
                  <label className="text-gray-700">Time:</label>
                  <select
                    onChange={(e) => setSelectedLine(e.target.value)}
                    value={selectedLine}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700">
                    <option value="Line 1">Line 1</option>
                    <option value="Line 2">Line 2</option>
                    <option value="Line 3">Line 3</option>
                  </select>
                </div>
            <img key={content} src={`https://img.vietqr.io/image/${MY_BANK}-${ACCOUNT_NO}-compact2.png?amount=${price}&addInfo=${content}&accountName=${ACCOUNT_NAME}`}></img>
          </div>
          <div className='flex items-center justify-center h-16 gap-8'>
            <button
                onClick={() => (window.location.href = "/home")}
                className='bg-gray-500 hover:bg-gray-400 text-white font-bold py-2
            px-6 rounded-md'>
              {" "}
              Cancel
            </button>
          </div>
        </div>
      </div>
  );
};

export default Purchase;