import { Button, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import CreateMaintenance from "@/components/SmallForm/CreateMaintenance";
import { useMutation } from "react-query";
import * as BillService from "@/services/billService";
import { useSelector } from "react-redux";
import { formatToVND } from "@/utils/translateToVND";

const RequestPage = () => {
  const [showRequest, setShowRequest] = useState(false);
  const [items, setItems] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const account = useSelector((state) => state.account);
  const [selectedImage, setSelectedImage] = useState(null);

  const mutateGetAll = useMutation({
    mutationFn: async (id) => {
      return await BillService.getDetailBill(id);
    },
    onSuccess: (data) => {
      setItems(data.data);
      setLoading(false);
    },
    onError: (error) => {
      console.log(error);
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
    mutateGetAll.mutate(account?._id);
  }, [refresh]);

  const itemArray = Array.isArray(items) ? items : [items];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Your Maintenance</h1>
        <Button
          type="primary"
          size="large"
          onClick={() => setShowRequest(true)}
          className="!bg-green-500 hover:!bg-green-400 !border-green-500">
          Create Maintenance
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <Skeleton
                key={index}
                active
                paragraph={{ rows: 4 }}
                className="p-6 rounded-lg shadow-lg bg-white"
              />
            ))
          : itemArray
              .slice()
              .reverse()
              .map((item, index) => (
                <div
                  key={item.id}
                  className={`p-6 rounded-lg flex flex-col justify-between shadow-lg transition-transform transform hover:scale-105 ${
                    item.status === "Pending"
                      ? "bg-yellow-100 border-l-4 border-yellow-500"
                      : item.status === "Approve"
                      ? "bg-green-100 border-l-4 border-green-500"
                      : "bg-red-100 border-l-4 border-red-500"
                  }`}>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h2>
                    <p className="text-gray-600 mt-2">{item.content}</p>
                    <p className="text-sm text-gray-500">
                      <strong>ID:</strong> {item.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>License Plate:</strong> {item?.bus?.license_plate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mt-4">
                      <strong>Start Date:</strong>{" "}
                      {new Date(item.start_date).toLocaleDateString("en-GB")}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>End Date:</strong>{" "}
                      {new Date(item.end_date).toLocaleDateString("en-GB")}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Price:</strong> {formatToVND(item.price)}
                    </p>
                    <p
                      className={`text-sm font-semibold mt-2 ${
                        item.status === "Pending"
                          ? "text-yellow-600"
                          : item.status === "Approved"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      Status: {item.status}
                    </p>
                  </div>
                  <div>
                    <img
                      style={{
                        backgroundSize: "100% 100%",
                      }}
                      src={item.image}
                      alt="Example"
                      className="mt-4 rounded-md shadow-md object-cover h-32 w-full cursor-pointer"
                      onClick={() => setSelectedImage(item.image)}
                    />
                  </div>
                </div>
              ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          onClick={() => setSelectedImage(null)}>
          <img
            src={selectedImage}
            alt="Zoomed"
            className="max-w-full max-h-full rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()} // Ngăn lớp phủ đóng khi nhấn vào ảnh
          />
        </div>
      )}
      {showRequest && (
        <>
          <div
            className="fixed w-full inset-0 bg-black bg-opacity-50 z-[9998]"
            onClick={() => setShowRequest(false)}></div>
          <div className="fixed w-full top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-[9999] animate-fade-in">
            <CreateMaintenance
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
