import { Button, Input } from "antd";
import React, { useState } from "react";
import RequestForm from "@/components/SmallForm/RequestForm";

const RequestPage = () => {
  const [showRequest, setShowRequest] = useState(false);

  const items = [
    {
      id: "L001",
      title: "Salary Increase",
      content: "I would like to request a salary increase.",
      sender: "John",
      receiver: "HR Department",
      status: "pending",
      feedback: "",
    },
    {
      id: "L002",
      title: "Work Schedule Adjustment",
      content: "Can I adjust my work hours to 9 AM - 6 PM?",
      sender: "Emily",
      receiver: "Manager",
      status: "approved",
      feedback: "Approved, effective next month.",
    },
    {
      id: "L003",
      title: "Request for Leave",
      content: "I need leave from 10th to 15th due to personal reasons.",
      sender: "Michael",
      receiver: "Admin",
      status: "rejected",
      feedback: "Rejected due to project deadlines.",
    },
    {
      id: "L004",
      title: "Training Program Suggestion",
      content: "Can we have a workshop on React.js for the team?",
      sender: "Sophia",
      receiver: "Team Lead",
      status: "pending",
      feedback: "",
    },
    {
      id: "L005",
      title: "Office Equipment Request",
      content: "I need a new chair for better ergonomics.",
      sender: "David",
      receiver: "Office Admin",
      status: "approved",
      feedback: "Chair will be delivered by next week.",
    },
    {
      id: "L006",
      title: "IT Support Needed",
      content: "My laptop is running slow; can IT check it?",
      sender: "Linda",
      receiver: "IT Department",
      status: "resolved",
      feedback: "Issue resolved. Laptop upgraded with new SSD.",
    },
    {
      id: "L007",
      title: "Team Outing Proposal",
      content: "Can we plan a team outing for this quarter?",
      sender: "Chris",
      receiver: "Team Manager",
      status: "pending",
      feedback: "",
    },
  ];

  const onCreate = () => {
    console.log("Feedback submitted:", feedbackValue);
    setFeedbackValue("");
  };

  return (
    <div className='p-8 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-700'>Request Management</h1>
        <Button
          type='primary'
          size='large'
          onClick={() => setShowRequest(true)}
          className='!bg-green-500 hover:!bg-green-400 !border-green-500'>
          Create Request
        </Button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg shadow-lg ${
              item.status === "approved"
                ? "bg-green-50 border-l-4 border-green-500"
                : item.status === "rejected"
                ? "bg-red-50 border-l-4 border-red-500"
                : "bg-yellow-50 border-l-4 border-yellow-500"
            }`}>
            <h2 className='text-lg font-semibold text-gray-800'>
              {item.title}
            </h2>
            <p className='text-gray-600 mt-2'>{item.content}</p>
            <div className='mt-4'>
              <p className='text-sm text-gray-500'>
                <strong>Sent:</strong> Hôm qua
              </p>
              <p
                className={`text-sm font-semibold mt-2 ${
                  item.status === "approved"
                    ? "text-green-600"
                    : item.status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}>
                Status: {item.status}
              </p>
            </div>
            {item.feedback && (
              <div className='mt-4 bg-blue-50 p-3 rounded'>
                <h3 className='text-blue-600 font-semibold'>Feedback</h3>
                <p className='text-gray-700'>
                  {item.feedback || "No feedback provided."}
                </p>

                <div className='mt-2 text-sm text-gray-500'>
                  <p className='text-sm text-gray-500'>
                    <strong>Receiver:</strong> {item.receiver}
                  </p>
                  <p>
                    <strong>Feedback Received:</strong> Hồi nãy
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
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default RequestPage;
