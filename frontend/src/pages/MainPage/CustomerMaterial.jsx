import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import OpinionForm from "../../components/SmallForm/OpinionForm";
const CustomerMaterial = () => {
  const tickets = [
    {
      title: "T01",
      customer: "Nguyen Thi B",
      expiration_date: "2022-04-15",
      status: "Valid",
    },
    {
      title: "T02",
      customer: "Nguyen Van A",
      expiration_date: "2021-10-10",
      status: "Expired",
    },
    {
      title: "T03",
      customer: "Tran Thi C",
      expiration_date: "2023-02-25",
      status: "Valid",
    },
    {
      title: "T04",
      customer: "Le Minh D",
      expiration_date: "2023-06-10",
      status: "Expired",
    },
  ];

  const reflects = [
    {
      title: "Phản ánh thái độ nhân viên",
      content:
        "Nhân viên phục vụ nhiệt tình, giải đáp mọi thắc mắc của khách hàng một cách nhanh chóng và thân thiện.",
      status: "Resolved",
      receive_date: "2022-03-16",
      feedback: "Customer is satisfied with the solution.",
      resolve_date: "2022-03-18",
      receiver: "Nguyen Thi B",
    },
    {
      title: "Phản ánh về chất lượng dịch vụ",
      content:
        "Dịch vụ có một số vấn đề về chất lượng, cần cải thiện quy trình chăm sóc khách hàng.",
      status: "Pending",
      receive_date: "2021-10-11",
      feedback: "Ticket awaiting further investigation.",
      resolve_date: null,
      receiver: "Nguyen Van A",
    },
    {
      title: "Phản ánh thái độ nhân viên",
      content:
        "Nhân viên cần cải thiện kỹ năng giao tiếp, thái độ chưa thực sự thân thiện.",
      status: "Resolved",
      receive_date: "2023-01-26",
      feedback: "Problem solved, issue resolved after software update.",
      resolve_date: "2023-01-28",
      receiver: "Tran Thi C",
    },
    {
      title: "Phản ánh về thời gian giải quyết",
      content:
        "Thời gian giải quyết vấn đề còn chậm, cần cải thiện tốc độ xử lý yêu cầu của khách hàng.",
      status: "Resolved",
      receive_date: "2023-05-12",
      feedback: "Issue was fixed, customer is happy with the resolution.",
      resolve_date: "2023-05-14",
      receiver: "Le Minh D",
    },
  ];
  const [showRequest, setShowRequest] = useState(false);
  const [refresh, setRefresh] = useState(false);

  return (
    <div className='bg-slate-200 p-4 overflow-y-auto h-full scrollbar-hide'>
      <div className='bg-white p-6 h-max w-full border border-slate-300 m-2 shadow-md rounded-md'>
        <h3 className='text-xl font-semibold mb-4'>Your Ticket </h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {tickets
            .slice()
            .reverse()
            .map((ticket) => (
              <div
                key={ticket.title}
                className={`p-4 rounded-lg flex flex-col justify-between shadow-lg ${
                  ticket.status === "Valid"
                    ? "bg-green-100 border-l-4 border-green-500"
                    : "bg-red-100 border-l-4 border-red-500"
                }`}>
                <div>
                  <h2 className='text-lg font-semibold text-gray-800'>
                    {ticket.title}
                  </h2>
                  <p className='text-gray-600 mt-2'>
                    <strong>Customer:</strong> {ticket.customer}
                  </p>
                  <p className='text-gray-600 mt-2'>
                    <strong>Expiration:</strong> {ticket.expiration_date}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold mt-2 ${
                      ticket.status === "Valid"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                    Status: {ticket.status}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className='bg-white p-6 h-full overflow-x-auto w-full mt-4 border border-slate-300 m-2 shadow-md rounded-md'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-semibold mb-4'>Your Reflects</h3>
          <Button onClick={() => setShowRequest(true)}>Reflect</Button>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6'>
          {reflects
            .slice()
            .reverse()
            .map((reflect) => (
              <div
                key={reflect.title}
                className={`p-4 rounded-lg flex flex-col justify-between shadow-lg ${
                  reflect.status === "Resolved"
                    ? "bg-green-100 border-l-4 border-green-500"
                    : "bg-yellow-100 border-l-4 border-yellow-500"
                }`}>
                <div>
                  <h2 className='text-lg font-semibold text-gray-800'>
                    {reflect.title}
                  </h2>
                  <p className='text-gray-600 mt-2'>
                    <strong>Content:</strong> {reflect.content}
                  </p>
                  {reflect.status === "Resolved" && (
                    <div>
                      <p className='text-gray-600 mt-2'>
                        <strong>Receiver:</strong> {reflect.receiver}
                      </p>
                      <p className='text-gray-600 mt-2'>
                        <strong>Feedback:</strong> {reflect.feedback}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <p className='text-sm text-gray-500 mt-2'>
                    <strong>Received Date:</strong> {reflect.receive_date}
                  </p>
                  {reflect.resolve_date && (
                    <p className='text-sm text-gray-500 mt-2'>
                      <strong>Resolve Date:</strong> {reflect.resolve_date}
                    </p>
                  )}
                  <p
                    className={`text-sm font-semibold mt-2 ${
                      reflect.status === "Resolved"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}>
                    Status: {reflect.status}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
      {showRequest && (
        <>
          <div
            className='fixed inset-0 bg-black bg-opacity-50 z-[9998]'
            onClick={() => {
              setShowRequest(false);
            }}></div>
          <div className='fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-[9999] animate-fade-in'>
            <OpinionForm
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

export default CustomerMaterial;
