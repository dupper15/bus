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
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ClipLoader } from "react-spinners";

const SolveRequestForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [id, setId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const account = useSelector((state) => state.account);
  const manager = account?._id;

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
      setIsLoading(false);
    },
  });

  useEffect(() => {
    mutationGetRequests.mutate();
  }, []);

  const handleTextChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmit = (request, status) => {
    setIsSubmitting(true);
    mutationResolvedRequest.mutate({
      id: request.id,
      manager,
      status,
      feedback,
    });
    setIsSubmitting(false);
    setFeedback("");
    setIsLoading(true);
    mutationGetRequests.mutate();
  };

  return (
    <div className="w-full  bg-white shadow-lg rounded-xl p-4 md:p-8 border border-gray-300 custom-width">
      <h2 className="text-xl sm:text-2xl font-bold text-green-500 mb-6 sm:mb-8 text-center uppercase tracking-wide">
        Pending Requests
      </h2>

      {!isLoading ? (
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={30}
          slidesPerView={1}
          className=" w-full lg:w-[300px] block" // Đảm bảo là block và width 100%
          loop={false}
        >
          {requests.map((request, index) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col w-full space-y-4 py-6 px-8  border rounded-xl bg-gray-50 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  {request.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {request.content}
                </p>
                <div className="flex flex-col gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
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
                <div className="flex flex-col space-y-6 mt-6">
                  <textarea
                    onClick={() => {
                      setId(request.id);
                    }}
                    onChange={handleTextChange}
                    rows={5}
                    placeholder="Type your answer here..."
                    className="border rounded-lg p-4 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition w-full"
                  />
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <button
                      onClick={() => handleSubmit(request, "Rejected")}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center w-full sm:w-1/2 py-2 rounded-lg transition-all shadow-md space-x-2 ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      {isSubmitting ? (
                        <ClipLoader size={20} color="#fff" />
                      ) : (
                        <>
                          <RxCross1 className="text-lg" />
                          <span>Reject</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleSubmit(request, "Approved")}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center w-full sm:w-1/2 py-2 rounded-lg transition-all shadow-md space-x-2 ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {isSubmitting ? (
                        <ClipLoader size={20} color="#fff" />
                      ) : (
                        <>
                          <SiTicktick className="text-lg" />
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col space-y-4 py-6 px-8 sm:px-10 border rounded-xl bg-gray-50 shadow-md transition-shadow mb-6"
            >
              <Skeleton height={30} />
              <Skeleton count={3} />
              <div className="flex flex-col gap-3">
                <Skeleton width="60%" />
                <Skeleton width="50%" />
                <Skeleton width="70%" />
              </div>
              <div className="flex flex-col space-y-6 mt-6">
                <Skeleton height={80} />
                <div className="flex gap-4">
                  <Skeleton height={40} width="50%" />
                  <Skeleton height={40} width="50%" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolveRequestForm;
