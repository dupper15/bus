import Search from "@/components/ui/search";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useSearchParams } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import CheckInForm from "@/components/SmallForm/CheckInForm";
const items = [
  {
    id: "L001",
    name: "01",
    start_place: "võ văn ngân",
    end_place: "nguyễn thị minh khai",
    time: "1 tiếng 15p",
  },
  {
    id: "L002",
    name: "02",
    start_place: "Tân Sơn Nhất",
    end_place: "Bến Thành",
    time: "45 phút",
  },
  {
    id: "L003",
    name: "03",
    start_place: "Bến Thành",
    end_place: "Chợ Lớn",
    time: "1 tiếng",
  },
  {
    id: "L004",
    name: "04",
    start_place: "Chợ Lớn",
    end_place: "Gò Vấp",
    time: "1 tiếng 20 phút",
  },
  {
    id: "L005",
    name: "05",
    start_place: "Bình Thạnh",
    end_place: "Quận 7",
    time: "50 phút",
  },
];
const TaskPage = () => {
  const ITEMS_PER_PAGE = 10;
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const currentItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(searchWord.toLowerCase())
    )
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page });
    }
  };
  const handleSearchChanged = (e) => {
    setSearchWord(e.target.value);
    setSearchParams({ page: 1 });
  };

  // trả về các tuyến, giờ, bến xe mà nhân viên này làm
  const taskItems = [
    {
      name: "003", // tên chuyến
      scheduleId: "S001", // id lịch trình
      station: "Bến Xe Miền Tây", // bến xe
      time: "9h", // giờ bắt đầu
      license_plate: "51A-123",
      status: "Not yet",
    },
    {
      name: "001", // tên chuyến
      scheduleId: "S002", // id lịch trình
      station: "Bến Xe Miền Đông", // bến xe
      time: "10h", // giờ bắt đầu
      license_plate: "51A-423",
      status: "Done",
    },
    {
      name: "002", // tên chuyến,
      scheduleId: "S003", // id lịch trình
      station: "Bến Xe Miền Tây", // bến xe
      time: "11h", // giờ bắt đầu
      license_plate: "51A-123",
      status: "Waiting",
    },
  ];
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState("");
  const handleCheckIn = (scheduleId) => {
    setCurrentScheduleId(scheduleId);
    setShowCheckIn(true);
  };

  return (
    <div className='flex flex-wrap gap-8 bg-gray-100 p-8 h-full w-full'>
      {/* Bảng và tìm kiếm */}
      <div className='flex flex-col flex-grow gap-4 bg-white py-4 px-8 rounded-lg shadow-md border border-gray-200'>
        <div className='flex items-center gap-4'>
          <Search
            className='flex-grow border border-gray-300 rounded-lg p-2'
            onChange={handleSearchChanged}
            text='Type line name...'
          />
        </div>
        <div className='overflow-x-auto rounded-lg bg-white shadow-md'>
          <Table className='overflow-hidden rounded-t-lg border border-gray-300'>
            <TableHeader className='bg-green-500 rounded-t-lg pointer-events-none'>
              <TableRow>
                {["Id", "Name", "Start place", "End place", "Time"].map(
                  (header, idx) => (
                    <TableHead
                      key={idx}
                      className='text-center text-white text-base py-3 px-4'>
                      {header}
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className='text-center py-3 px-4'>
                    {item.id}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.name}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.start_place}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.end_place}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination className='flex justify-center items-center gap-4'>
          <PaginationContent className='flex gap-2'>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                onClick={() => handlePageChange(currentPage - 1)}
                className='text-green-500 hover:text-green-700'>
                Previous
              </PaginationPrevious>
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href='#'
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-full transition ${
                    index + 1 === currentPage
                      ? "bg-green-500 text-white"
                      : "hover:bg-gray-200"
                  }`}>
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href='#'
                onClick={() => handlePageChange(currentPage + 1)}
                className='text-green-500 hover:text-green-700'>
                Next
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      {/* Task */}
      <div
        className={`rounded-lg p-8 shadow-md border bg-white border-gray-200 w-80`}>
        <div className='text-2xl font-semibold mb-4 text-white bg-gradient-to-r from-green-500 to-green-500 shadow-lg rounded-lg py-3 px-5 text-center'>
          Tasks
        </div>

        <div className='space-y-6'>
          {taskItems.map((item, index) => (
            <div
              key={index}
              className={`p-5 rounded-lg shadow-md border ${
                item.status === "Done" ? "bg-green-200" : "bg-white"
              }  border-gray-200  transition`}>
              <div className='grid grid-cols-2 gap-y-2'>
                <div className='text-lg font-medium text-gray-800 col-span-2'>
                  Line: {item.name}
                </div>
                <div className='text-sm text-gray-600'>
                  <span className='font-semibold text-gray-700'>Station:</span>{" "}
                  {item.station}
                </div>
                <div className='text-sm text-gray-600'>
                  <span className='font-semibold text-gray-700'>
                    License plate:
                  </span>{" "}
                  {item.license_plate}
                </div>
                <div className='text-sm text-gray-600'>
                  <span className='font-semibold text-gray-700'>
                    Time start:
                  </span>{" "}
                  {item.time}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    item.status === "Done"
                      ? "text-green-500"
                      : item.status === "Waiting"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}>
                  <span className='text-gray-700'>Status:</span>{" "}
                  {item.status || "Unknown"}
                </div>
              </div>
              <div className='mt-4 text-right'>
                <button
                  onClick={() => {
                    handleCheckIn(item.scheduleId);
                  }}
                  className={`px-4 py-2 rounded-md ${
                    item.status === "Done"
                      ? "bg-green-500 pointer-events-none"
                      : "bg-yellow-400"
                  } text-white font-medium hover:bg-yellow-300 transition`}>
                  {item.status === "Done" ? <>Checked In</> : <>Check In</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showCheckIn && (
        <>
          <div
            className='fixed inset-0 bg-black bg-opacity-50 z-[9998]'
            onClick={() => {
              setShowCheckIn(false);
            }}></div>
          <div className='fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-[9999] animate-fade-in'>
            <CheckInForm
              childCloseFormRequest={() => {
                setShowCheckIn(false);
              }}
              scheduleId={currentScheduleId}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TaskPage;
