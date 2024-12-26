import React, { useState } from "react";
import { useMutation } from "react-query";
import * as RequestService from "@/services/requestService";
import * as Message from "@/components/ui/alert"
import { useSelector } from "react-redux";

const RequestForm = ({ childCloseFormRequest }) => {
  const [request, setRequest] = useState("");
  const [title, setTitle] = useState("");

  const account = useSelector((state) => state.account)

  const mutaionCreate = useMutation({
    mutationFn: async ({data}) => {
      return await RequestService.createRequest(data)
    },
    onSuccess: (data) => {
      if (data.status === "OK"){
        Message.success(data.message);
        childCloseFormRequest();
      } else {
        Message.error(data.message);
      }
    },
    onError: (error) => {
      console.log(error);
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault();
    const values = {
      _id: account?._id,
      title: title,
      content: request
    }
    mutaionCreate.mutate({data: values})
  };

  return (
    <form
      className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96 bg-white p-8 rounded-lg shadow-lg border border-gray-200'
      onSubmit={handleSubmit}>
      {/* Close button */}
      <button
        type='button'
        className='absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none'
        onClick={() => childCloseFormRequest(false)}>
        ×
      </button>

      {/* Form Title */}
      <h1 className='text-2xl font-bold text-gray-800 mb-4 text-center'>
        Request
      </h1>
      <textarea
        rows={1}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder='Title of your request...'
        className='w-full p-4 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder-gray-400 mb-4'></textarea>
      {/* Input Field */}
      <textarea
        rows={5}
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        placeholder='Content of your request...'
        className='w-full p-4 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder-gray-400 mb-4'></textarea>

      {/* Submit Button */}
      <button
        type='submit'
        className='w-full py-3 text-lg font-semibold text-white bg-green-500 rounded-lg hover:bg-green-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2'>
        Send Request
      </button>
    </form>
  );
};

export default RequestForm;
