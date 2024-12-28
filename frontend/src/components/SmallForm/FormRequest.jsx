import { Input } from "@/components/ui/input";
import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useMutation } from "react-query";
import * as OpinionService from "../../services/opinionService";
import * as Message from "../../components/ui/alert";
import { useSelector } from "react-redux";

const FormRequest = ({ handleClose, request}) => {

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 w-screen h-screen backdrop-blur-sm flex justify-center items-center">
      <div className="relative w-3/4 max-w-2xl bg-white shadow-lg border border-slate-500 rounded-lg p-8 space-y-6">
        <IoIosArrowBack
          onClick={handleClose}
          className="text-xl cursor-pointer"
        />

        <h1 className="text-3xl font-bold text-green-500 text-center">
          Request Detail
        </h1>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <h3 className="text-green-600 font-semibold mb-2">
              Request of employee
            </h3>
            <p className="text-gray-700">{request.content || "No content provided"}</p>
          </div>

          {request.feedback && (
            <div className='p-4 bg-blue-50 border-r-4 border-blue-500 rounded text-right'>
              <h3 className='text-blue-600 font-semibold mb-2'>Our Feedback</h3>
              <p className='text-gray-700'>{request.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormRequest;
