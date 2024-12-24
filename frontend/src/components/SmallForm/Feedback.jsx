import { Input } from "@/components/ui/input";
import { IoIosArrowBack } from "react-icons/io";

const Feedback = ({ handleClose, content, feedback = "" }) => {
  const onCreate = (e) => {
    e.preventDefault();
    console.log("Form submitted successfully");
  };

  return (
    <div className='absolute inset-0 bg-black bg-opacity-90 w-screen h-screen backdrop-blur-sm flex justify-center items-center'>
      <div className='relative w-3/4 max-w-2xl bg-white shadow-lg border border-slate-500 rounded-lg p-8 space-y-6'>
        <IoIosArrowBack
          onClick={handleClose}
          className='text-xl cursor-pointer'
        />

        <h1 className='text-3xl font-bold text-green-500 text-center'>
          Customer Feedback
        </h1>

        <div className='space-y-4'>
          <div className='p-4 bg-green-50 border-l-4 border-green-500 rounded'>
            <h3 className='text-green-600 font-semibold mb-2'>
              Opinion of Customer
            </h3>
            <p className='text-gray-700'>{content || "No content provided"}</p>
          </div>

          {feedback && (
            <div className='p-4 bg-blue-50 border-r-4 border-blue-500 rounded text-right'>
              <h3 className='text-blue-600 font-semibold mb-2'>Our Feedback</h3>
              <p className='text-gray-700'>{feedback}</p>
            </div>
          )}
        </div>

        <div className='space-y-4'>
          <Input
            type='text'
            placeholder='Write your feedback here...'
            className='w-full border border-green-500 rounded p-3'
          />
          <button
            onClick={onCreate}
            className='w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600'>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
