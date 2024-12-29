import React, { useState } from "react";
import { useMutation } from "react-query";
import * as BillService from "@/services/billService";
import * as Message from "@/components/ui/alert";
import { useSelector } from "react-redux";


const CreateMaintenance = ({ childCloseFormRequest }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const account = useSelector((state) => state.account);

  const mutationCreate = useMutation({
    mutationFn: async ({ data }) => {
      return await BillService.createBill(data);
    },
    onSuccess: (data) => {
      if (data.status === "OK") {
        Message.success(data.message);
        childCloseFormRequest();
      } else {
        Message.error(data.message);
      }
    },
    onError: (error) => {
      console.log(error);
      Message.error("An error occurred. Please try again later.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content || !licensePlate || !startDate || !endDate || !price) {
      Message.error("Please fill in all fields.");
      return;
    }
    const values = {
      employee: account?._id,
      title: title,
      content: content,
      license_plate: licensePlate,
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      price: price,
      image: previewImage,
    };

    mutationCreate.mutate({ data: values });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const uploadPreset = "afh5sfc";
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch("https://api.cloudinary.com/v1_1/ddcjjegzf/image/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    setProofImage(file);
    setPreviewImage(result.secure_url);
  };

  return (
    <form
      className='fixed h-auto max-h-[80vh] scrollbar-hide w-max overflow-y-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-lg bg-white p-6 rounded-2xl shadow-2xl border border-gray-200'
      onSubmit={handleSubmit}>
      {/* Close button */}
      <button
        type='button'
        className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none'
        onClick={() => childCloseFormRequest(false)}>
        ×
      </button>

      <h1 className='text-3xl font-bold text-gray-800 mb-6 text-center'>
        Create Maintenance
      </h1>

       {/* Title Input */}
       <div className='mb-4'>
        <textarea
          rows={1}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Title of your request...'
          className='w-full p-4 text-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400'></textarea>
      </div>

      {/* Content Input */}
      <div className='mb-4'>
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='Content of your request...'
          className='w-full p-4 text-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400'></textarea>
      </div>

      {/* License Plate */}
      <div className='mb-4'>
        <input
          type='text'
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          placeholder='License Plate...'
          className='w-full p-4 text-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'></input>
      </div>

      {/* Start Date */}
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-600 mb-1'>
          Start Date
        </label>
        <input
          type='date'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className='w-full p-4 text-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'></input>
      </div>

      {/* End Date */}
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-600 mb-1'>
          End Date
        </label>
        <input
          type='date'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className='w-full p-4 text-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'></input>
      </div>

      {/* Price */}
      <div className='mb-4'>
        <input
          type='text'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder='Price...'
          className='w-full p-4 text-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'></input>
      </div>

      {/* Upload Proof */}
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-600 mb-1'>
          Upload Proof
        </label>
        <input
          type='file'
          onChange={handleFileChange}
          accept='image/*'
          className='w-full p-4 text-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'></input>
      </div>

      {/* Preview Proof */}
      {previewImage && (
        <div className='mb-4'>
          <p className='text-sm text-gray-600 mb-2'>Image Preview:</p>
          <img
            src={previewImage}
            alt='Preview'
            className='w-full h-auto rounded-lg border border-gray-300 shadow-sm'
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        type='submit'
        className='w-full py-3 text-lg font-semibold text-white bg-green-500 rounded-xl hover:bg-green-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
        Send Request
      </button>
    </form>
  );
};

export default CreateMaintenance;
