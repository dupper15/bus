import React, { useState } from "react";

const CheckInForm = ({ childCloseFormRequest, scheduleId }) => {
  const [ticket3, setTicket3] = useState("");
  const [ticket7, setTicket7] = useState("");

  const handleOnChange3 = (e) => {
    setTicket3(e.target.value);
  };

  const handleOnChange7 = (e) => {
    setTicket7(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Sửa lỗi ở đây
    console.log("Ticket 3k:", ticket3);
    console.log("Ticket 7k:", ticket7);
  };

  return (
    <form
      className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-white p-6 rounded-lg shadow-lg border border-gray-300'
      onSubmit={handleSubmit}>
      {/* Close button */}
      <button
        type='button'
        className='absolute top-2 right-4 text-gray-500 hover:text-gray-700 font-bold text-2xl'
        onClick={() => childCloseFormRequest(false)}>
        ×
      </button>

      {/* Form Title */}
      <h1 className='text-2xl font-semibold text-gray-600 mb-6'>Check In</h1>

      {/* Ticket 3k Input */}
      <div className='mb-4'>
        <input
          name='ticket3'
          value={ticket3}
          onChange={handleOnChange3}
          type='number'
          min='0'
          placeholder='Enter quantity of 3k tickets...'
          className='w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400'
        />
      </div>

      {/* Ticket 7k Input */}
      <div className='mb-4'>
        <input
          name='ticket7'
          value={ticket7}
          onChange={handleOnChange7}
          type='number'
          min='0'
          placeholder='Enter quantity of 7k tickets...'
          className='w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400'
        />
      </div>

      {/* Submit Button */}
      <button
        type='submit'
        className='w-full py-3 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 transition duration-200'>
        Submit
      </button>
    </form>
  );
};

export default CheckInForm;
