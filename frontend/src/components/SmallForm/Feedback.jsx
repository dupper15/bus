import { Input } from "@/components/ui/input";
import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useMutation } from "react-query";
import * as OpinionService from "../../services/opinionService";
import * as Message from "../../components/ui/alert";
import { useSelector } from "react-redux";

const Feedback = ({ childCloseFormRequest, opinion}) => {

  const account = useSelector((state) => state.account)
  const mutationResolved = useMutation({
    mutationFn: ({data}) => {
      return OpinionService.resolvedOpinion(data);
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      if (data.status === "ERROR") {
        Message.error(data.message); // Hiển thị lỗi từ API
      } else if (data.status === "OK") {
        Message.success(data.message); // Hiển thị thông báo thành công
        childCloseFormRequest();
      }
    },
  })

  const onCreate = () => {
    const values = {
      _id: opinion._id,
      manager: account._id,
      feedback: feedbackValue,
    };
    mutationResolved.mutate({ data: values });
  };
  
  const [feedbackValue, setFeedbackValue] = useState(opinion.feedback);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 w-screen h-screen backdrop-blur-sm flex justify-center items-center">
      <div className="relative w-3/4 max-w-2xl bg-white shadow-lg border border-slate-500 rounded-lg p-8 space-y-6">
        <IoIosArrowBack
          onClick={childCloseFormRequest}
          className="text-xl cursor-pointer"
        />

        <h1 className="text-3xl font-bold text-green-500 text-center">
          Customer Feedback
        </h1>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <h3 className="text-green-600 font-semibold mb-2">
              Opinion of Customer
            </h3>
            <p className="text-gray-700">{opinion.content || "No content provided"}</p>
          </div>

          {opinion.feedback && (
            <div className='p-4 bg-blue-50 border-r-4 border-blue-500 rounded text-right'>
              <h3 className='text-blue-600 font-semibold mb-2'>Our Feedback</h3>
              <p className='text-gray-700'>{opinion.feedback}</p>
            </div>
          )}
        </div>

        { opinion.status === "Pending" && (
          <div className="space-y-4">
          <Input
            type='text'
            value={feedbackValue}
            onChange={(e) => setFeedbackValue(e.target.value)}
            placeholder='Write your feedback here...'
            className='w-full border border-green-500 rounded p-3'
          />
          <button
            onClick={onCreate}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600">
            Submit
          </button>
        </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
