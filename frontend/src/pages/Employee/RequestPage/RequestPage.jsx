import { Button, Input } from "antd";
import React, { useEffect, useState } from "react";
import RequestForm from "@/components/SmallForm/RequestForm";
import { useMutation } from "react-query";
import * as RequestService from "@/services/requestService";
import { useSelector } from "react-redux";
import { set } from "date-fns";

const RequestPage = () => {
  const [showRequest, setShowRequest] = useState(false);
  const [items, setItems] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const account = useSelector((state) => state.account);

  const mutateGetAll = useMutation({
    mutationFn: async (id) => {
      return await RequestService.getDetailRequest(id);
    },
    onSuccess: (data) => {
      setItems(data.data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    mutateGetAll.mutate(account?._id);
  }, [refresh]);

  return (
    <div className='p-8 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>Your Maintenance</h1>
        <Button
          type='primary'
          size='large'
          onClick={() => setShowRequest(true)}
          className='!bg-green-500 hover:!bg-green-400 !border-green-500'>
          Create Request
        </Button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {items
          .slice()
          .reverse()
          .map((item, index) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg flex flex-col justify-between shadow-lg ${
                item.status === "Approved"
                  ? "bg-green-100 border-l-4 border-green-500"
                  : item.status === "Rejected"
                  ? "bg-red-100 border-l-4 border-red-500"
                  : "bg-yellow-100 border-l-4 border-yellow-500"
              }`}>
              <div>
                <h2 className='text-lg font-semibold text-gray-800'>
                  {item.title}
                </h2>
                <p className='text-gray-600 mt-2'>{item.content}</p>
              </div>
              <div>
                <div className='relative mt-4'>
                  <p className='text-sm text-gray-500'>
                    <strong>ID:</strong> {item.id}
                  </p>
                  <p className='text-sm text-gray-500'>
                    <strong>Sent: </strong>
                    {new Date(item.date_requested).toLocaleDateString("en-GB")}
                  </p>
                  <p
                    className={`text-sm font-semibold mt-2 ${
                      item.status === "Approved"
                        ? "text-green-600"
                        : item.status === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}>
                    Status: {item.status}
                  </p>
                </div>
              </div>
              {item.feedback && (
                <div className='mt-4 bg-blue-100 p-3 rounded'>
                  <h3 className='text-blue-600 font-semibold'>Feedback</h3>
                  <p className='text-gray-700'>
                    {item.feedback || "No feedback provided."}
                  </p>
                  <div className='mt-2 text-sm text-gray-500'>
                    <p className='text-sm text-gray-500'>
                      <strong>Receiver:</strong> {item?.manager?.name}
                    </p>
                    <p>
                      <p className='text-sm text-gray-500'>
                        <strong>Feedback Received:</strong>{" "}
                        {new Date(item.updatedAt).toLocaleDateString("en-GB")}
                      </p>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
      {showRequest && (
        <>
          <div
            className='fixed inset-0 bg-black bg-opacity-50 z-[9998]'
            onClick={() => {
              setShowRequest(false);
            }}></div>
          <div className='fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-[9999] animate-fade-in'>
            <RequestForm
              childCloseFormRequest={() => {
                setShowRequest(false);
                setRefresh(!refresh);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default RequestPage;
