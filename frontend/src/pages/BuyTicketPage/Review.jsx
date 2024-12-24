// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Link } from 'react-router-dom';
import usePurchasePagesViewModel from './PurchasePagesViewModel';

// eslint-disable-next-line react/prop-types
const Review = ({ nextStep, prevStep }) => {
  const { purchaseData } = usePurchasePagesViewModel();

  return (
      <div className='flex flex-col'>
        <div className='text-black text-4xl font-bold ml-4 mb-4'>
          Order Confirmation
        </div>
        <div className='max-w-4xl mx-auto p-6 bg-white border border-gray-200 rounded shadow-md space-y-6'>
          <div className='grid grid-cols-2 gap-8'>
            <div>
              <h2 className='text-lg font-bold mb-4'>Your Information</h2>
              <div className='space-y-2'>
                <div>
                  <span className='font-bold'>Name:</span> {purchaseData.name}
                </div>
                <div>
                  <span className='font-bold'>Email:</span> {purchaseData.email}
                </div>
                <div>
                  <span className='font-bold'>Payment Information:</span> {purchaseData.paymentInfo}
                </div>
                <div className='border p-4 text-center'>Credit Card</div>
              </div>
            </div>
            <div>
              <h2 className='text-lg font-bold mb-4'>Billing Address</h2>
              <div className='space-y-2'>
                <div>{purchaseData.billingAddress}</div>
                <div>{purchaseData.city}</div>
                <div>Vietnam</div>
                <div>{purchaseData.postalCode}</div>
              </div>
            </div>
          </div>
          <div className='border-t border-b py-4'>
            <h2 className='text-lg font-bold mb-4'>Product</h2>
            <div className='grid grid-cols-4 gap-4 text-sm font-medium'>
              <div>{purchaseData.product}</div>
              <div className='text-center'>Item Price</div>
              <div className='text-center'>Quantity</div>
              <div className='text-right'>Extended Price</div>
            </div>
            <div className='grid grid-cols-4 gap-4 text-sm mt-2'>
              <div>{purchaseData.product}</div>
              <div className='text-center'>US ${purchaseData.price}</div>
              <div className='text-center'>{purchaseData.quantity}</div>
              <div className='text-right'>US ${purchaseData.total}</div>
            </div>
          </div>
          <div className='grid grid-cols-2'>
            <div></div>
            <div className='space-y-2 text-sm border p-4'>
              <div className='flex justify-between'>
                <span>Total</span>
                <span>US ${purchaseData.total}</span>
              </div>
              <div className='flex justify-between'>
                <span>Tax (0%)</span>
                <span>US $0</span>
              </div>
              <div className='flex justify-between font-bold'>
                <span>Grand Total</span>
                <span>US ${purchaseData.total}</span>
              </div>
            </div>
          </div>
          <div className='text-sm'>
            <p>
              Order total: <span className='font-bold'>US ${purchaseData.total}</span>
            </p>
            <p className='mt-2 text-gray-600'>
              By proceeding to purchase, you are entering into an agreement with
              BusApp under the terms specified below. Personal data required in
              the order form is needed for entering into the agreement with BusApp
              and delivery of the products or services. BusApp may use your data
              as described in the{" "}
              <a href='#' className='text-blue-500 underline'>
                BusApp Privacy Policy
              </a>
              .
            </p>
            <div className='mt-4 flex items-center gap-2'>
              <input type='checkbox' id='agreement' className='h-4 w-4' />
              <label htmlFor='agreement' className='text-gray-700 text-sm'>
                I have read and agree to the following:{" "}
                <a href='#' className='text-blue-500 underline'>
                  BusApp Account Agreement
                </a>
                ,{" "}
                <a href='#' className='text-blue-500 underline'>
                  BusApp Purchase Terms
                </a>
                .
              </label>
            </div>
          </div>
          <div className='flex justify-between mt-6'>
            <Link
                to={`/payment`}
                type='button'
                onClick={prevStep}
                className='px-6 py-2 border rounded bg-gray-200 text-gray-800 hover:bg-gray-300'>
              Back
            </Link>
            <Link
                to='/payment/thanks'
                onClick={nextStep}
                className='px-6 py-2 rounded bg-[#4CAF50] text-white hover:bg-[#6bdb6f]'>
              Confirm
            </Link>
          </div>
        </div>
      </div>
  );
};

export default Review;