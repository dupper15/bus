import React from "react";
import visa from "../../assets/image 8.png";
import { Link } from "react-router-dom";
import usePurchasePagesViewModel from "./PurchasePagesViewModel";

const Purchase = ({ nextStep }) => {
  const { purchaseData, updatePurchaseData } = usePurchasePagesViewModel();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updatePurchaseData({ [name]: value });
  };

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
          <table className='table-auto border-0 border-transparent text-sm ml-32 mr-20 mt-8'>
            <tbody>
            <tr>
              <td className='font-bold text-xl p-3  align-top whitespace-nowrap'>
                Purchaser Information
              </td>
              <td className='gap-3 '>
                <div className='space-y-4'>
                  <div className='flex items-center gap-4'>
                    <label className='w-1/4'>Street address</label>
                    <input
                        type='text'
                        name='billingAddress'
                        value={purchaseData.billingAddress}
                        onChange={handleInputChange}
                        className='h-8 w-full border border-gray-400 px-2'
                    />
                  </div>
                  <div className='flex items-center gap-4'>
                    <label className='w-1/4'>City</label>
                    <input
                        type='text'
                        name='city'
                        value={purchaseData.city}
                        onChange={handleInputChange}
                        className='h-8 w-full border border-gray-400  px-2'
                    />
                  </div>
                  <div className='flex items-center gap-4'>
                    <label className='w-1/4'>Postal code / ZIP</label>
                    <input
                        type='text'
                        name='postalCode'
                        value={purchaseData.postalCode}
                        onChange={handleInputChange}
                        className='h-8 w-full border border-gray-400  px-2'
                    />
                  </div>
                  <div className='flex items-center gap-4'>
                    <label className='w-1/4'>Country / Region</label>
                    <span className='text-gray-700'>Vietnam</span>
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td className='font-bold text-xl p-3  align-top'>
                Purchaser Contact
              </td>
              <td className='p-3 '>
                <div className='space-y-4'>
                  <div className='flex items-center gap-4'>
                    <label className='w-1/4'>Email</label>
                    <input
                        type='email'
                        name='email'
                        value={purchaseData.email}
                        onChange={handleInputChange}
                        className='h-8 w-full border border-gray-400 px-2'
                    />
                  </div>
                  <div className='flex items-center gap-4'>
                    <label className='w-1/4'>Name</label>
                    <div className='flex gap-2 w-full'>
                      <input
                          type='text'
                          name='firstName'
                          value={purchaseData.firstName}
                          onChange={handleInputChange}
                          className='h-8 flex-1 border border-gray-400 rounded px-2'
                          placeholder='First Name'
                      />
                      <input
                          type='text'
                          name='lastName'
                          value={purchaseData.lastName}
                          onChange={handleInputChange}
                          className='h-8 flex-1 border border-gray-400 rounded px-2'
                          placeholder='Last Name'
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td className='font-bold text-xl p-3  align-top'>
                Payment Information
              </td>
              <td className='p-3 '>
                <div className='space-y-4'>
                  <input
                      type='text'
                      name='paymentInfo'
                      value={purchaseData.paymentInfo}
                      onChange={handleInputChange}
                      className='h-8 w-full border border-gray-400 rounded px-2'
                      placeholder='Card Number'
                  />
                  <img src={visa} alt='Visa' className='h-80 w-auto mt-2' />
                </div>
              </td>
            </tr>
            </tbody>
          </table>

          <div className='flex items-center justify-center h-16 gap-8'>
            <button
                onClick={() => (window.location.href = "/home")}
                className='bg-gray-500 hover:bg-gray-400 text-white font-bold py-2
            px-6 rounded-md'>
              {" "}
              Cancel
            </button>
            <Link
                to='/payment/review'
                className='px-6 py-2 rounded bg-[#4CAF50] text-white hover:bg-[#6bdb6f]'
                onClick={nextStep}>
              Review
            </Link>
          </div>
        </div>
      </div>
  );
};

export default Purchase;