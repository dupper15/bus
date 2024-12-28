import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useMutation } from "@tanstack/react-query";
import * as RequestService from "../../services/requestService";
import { RxCross1 } from "react-icons/rx";
import { SiTicktick } from "react-icons/si";
import { useSelector } from "react-redux";
import * as Message from "@/components/ui/alert";

const SolveRequestForm = () => {
  const [requests, setRequests] = useState([]);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const mutationResolvedRequest = useMutation({
    mutationFn: (data) => RequestService.resolvedRequest(data),
    onError: (error) => {
      console.error("Error resolving request:", error);
    },
    onSuccess: (data) => {
      Message.success("Solved request successfully");
      mutationGetRequests.mutate();
    },
  });
  const mutationGetRequests = useMutation({
    mutationFn: () => RequestService.getAllRequest(),
    onError: (error) => {
      console.error("Error fetching requests:", error);
    },
    onSuccess: (data) => {
      const formattedRequests = data.data.map((request) => ({
        id: request.id,
        employeeName: request.employee.name,
        position: request.employee.position,
        phone: request.employee.phone,
        title: request.title,
        content: request.content,
        sentAt: new Date(request.date_requested).toLocaleString(),
      }));
      setRequests(formattedRequests);
    },
  });

  useEffect(() => {
    mutationGetRequests.mutate();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
      window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const [id, setId] = useState("");
  const [feedback, setFeedback] = useState("");
  const handleTextChange = (e) => {
    setFeedback(e.target.value);
  };
  const account = useSelector((state) => state.account);
  const manager = account?._id;
  const handleSubmit = (status) => {
    mutationResolvedRequest.mutate({
      id: id,
      manager: manager,
      status: status,
      feedback,
    });
  };
  return (
    <div
      ref={containerRef}
      className='w-full bg-white shadow-lg rounded-xl p-8 border border-gray-300'>
      <h2 className='text-xl font-bold text-green-500 mb-8 text-center uppercase tracking-wide'>
        Pending Requests
      </h2>
      {containerWidth > 0 && (
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={30}
          slidesPerView={1}
          style={{ width: containerWidth }}
          loop={false}>
          {requests.map((request, index) => (
            <SwiperSlide key={index}>
              <div className='flex flex-col space-y-4 py-8 px-10 border rounded-xl bg-gray-50 shadow-md hover:shadow-lg transition-shadow'>
                <h3 className='text-xl font-bold text-gray-800'>
                  {request.title}
                </h3>
                <p className='text-sm text-gray-600 leading-relaxed'>
                  {request.content}
                </p>
                <div className='flex flex-col gap-3 text-sm text-gray-700'>
                  <div>
                    <strong>Employee:</strong> {request.employeeName}
                  </div>
                  <div>
                    <strong>Position:</strong> {request.position}
                  </div>
                  <div>
                    <strong>Phone:</strong> {request.phone}
                  </div>
                  <div>
                    <strong>Sent At:</strong> {request.sentAt}
                  </div>
                </div>
                <div className='flex flex-col space-y-6 mt-6'>
                  <textarea
                    onClick={() => {
                      setId(request.id);
                    }}
                    onChange={handleTextChange}
                    rows={5}
                    placeholder='Type your answer here...'
                    className='border rounded-lg p-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition w-full'
                  />
                  <div className='flex justify-between gap-4'>
                    <button
                      onClick={() => {
                        handleSubmit("Rejected");
                      }}
                      className='flex items-center justify-center w-1/2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md space-x-2'>
                      <RxCross1 className='text-lg' />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => {
                        handleSubmit("Approved");
                      }}
                      className='flex items-center justify-center w-1/2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md space-x-2'>
                      <SiTicktick className='text-lg' />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default SolveRequestForm;
