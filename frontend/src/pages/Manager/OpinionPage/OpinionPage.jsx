import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaLeaf, FaRegCalendarAlt } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import Feedback from "@/components/SmallForm/Feedback";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useMutation } from "react-query";
import * as Opinion from "../../../services/opinionService"

const OpinionPage = () => {
  const ITEMS_PER_PAGE = 10;
  const [items, setItems] = useState([]);
  const [refresh, setRefresh]= useState(0);
  const [selected, setSelected] = useState("");
  const [countPending, setCountPending] = useState("");
  const [countResolved, setCountResolved] = useState("");
  const [opinionPending, setOpinionPending] = useState([]);
  const [opinionResolved, setOpinionResolved] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedTime, setSelectedTime] = useState("All");

  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [currentItems, setCurrentItems] = useState([]);
  const [currentContent, setCurrentContent] = useState("");
  
  const handleClose = () => {
    setShowForm(false);
  };

  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page });
    }
  };

  const handleSearchChanged = (e) => {
    setSearchWord(e.target.value);
    setSearchParams({ page: 1 });
  };

  const paginatedItems = currentItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchStatus = () => {
    const filteredItems = items.filter((item) => {
      const matchesStatus = (() => {
        switch (selectedStatus) {
          case "Pending":
            return item?.status === "Pending";
          case "Resolved":
            return item?.status === "Resolved";
          default:
            return true; // Không lọc theo status
        }
      })();
  
      const matchesTitle = item?.title?.toLowerCase().includes(searchWord.toLowerCase());
  
      return matchesStatus && matchesTitle; // Phải khớp cả status và title
    });
  
    setCurrentItems(filteredItems);
  };
  
  const handleSearchTime = () => {
    const currentDate = new Date();
  
    const filteredItems = items.filter((item) => {
      const itemDate = new Date(item.receive_date); // Đảm bảo `item.receive_date` là chuỗi ngày hợp lệ
      const matchesTime = (() => {
        switch (selectedTime) {
          case "Today":
            return itemDate.toDateString() === currentDate.toDateString();
          case "This Week": {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Bắt đầu tuần (Chủ nhật)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Kết thúc tuần (Thứ bảy)
            return itemDate >= startOfWeek && itemDate <= endOfWeek;
          }
          case "This Month":
            return (
              itemDate.getFullYear() === currentDate.getFullYear() &&
              itemDate.getMonth() === currentDate.getMonth()
            );
          case "This Year":
            return itemDate.getFullYear() === currentDate.getFullYear();
          default: // "All"
            return true;
        }
      })();
  
      const matchesTitle = item?.title?.toLowerCase().includes(searchWord.toLowerCase());
  
      return matchesTime && matchesTitle; // Phải khớp cả thời gian và title
    });
  
    setCurrentItems(filteredItems);
  };
  
  useEffect(() => {
    handleSearchStatus();
  }, [selectedStatus, searchWord, items]);

  useEffect(() => {
    handleSearchTime();
  }, [selectedTime, searchWord, items]);

  const mutationGetAll = useMutation({
    mutationFn: () => {
      return Opinion.getAllOpinion();
    },
    onSuccess: (data) => {
      setItems(data.data)
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutationGetStatus = useMutation({
    mutationFn: () => {
      return Opinion.getAllStatus();
    },
    onSuccess: (data) => {
      setCountPending(data.data.pending);
      setCountResolved(data.data.resolved);
      setOpinionPending(data.data.opinionPending);
      setOpinionResolved(data.data.opinionResolved);

      setRefresh(!refresh)
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    mutationGetAll.mutate();
    mutationGetStatus.mutate();
  }, [])
  
  return (
    <div className="flex flex-row justify-center min-h-screen w-full p-6 bg-gray-100 space-x-6 py-4">
      <div className="w-2/3 space-y-6 flex flex-col bg-white shadow-lg rounded-xl p-6 border border-gray-300">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2 basis-1/5">
            <label className="text-gray-700">Status:</label>
            <select
              onChange={(e) => setSelectedStatus(e.target.value)}
              value={selectedStatus}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700">
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="basis-2/5">
            <Search
              className=" border border-gray-300 rounded-lg p-2"
              onChange={handleSearchChanged}
              text="Type title..."
            />
          </div>
          <div className="flex items-center gap-2 basis-1/5">
            <label className="text-gray-700">Time:</label>
            <select
              onChange={(e) => setSelectedTime(e.target.value)}
              value={selectedTime}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700">
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-300">
          <Table>
            <TableHeader className="bg-green-500 rounded-t-lg pointer-events-none">
              <TableRow>
                <TableHead className=" text-base text-center text-white">
                  Opinion ID
                </TableHead>
                <TableHead className=" text-base text-center text-white py-3 px-4">
                  Title
                </TableHead>
                <TableHead className="text-base text-center text-white py-3 px-4">
                  Customer ID
                </TableHead>
                <TableHead className=" text-base text-center text-white py-3 px-4">
                  Sender
                </TableHead>
                <TableHead className="text-base text-center text-white py-3 px-4">
                  Receive Date
                </TableHead>
                <TableHead className="text-base text-center text-white py-3 px-4">
                  Status
                </TableHead>
                <TableHead className="text-base text-center text-white py-3 px-4">
                  Resolver
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setShowForm(true);
                    setCurrentContent(item.content);
                    setCurrentFeedback(item.feedback);
                    setSelected(item);
                  }}>
                  <TableCell className='text-center' py-3 px-4>
                    {item.id}
                  </TableCell>
                  <TableCell className="font-medium text-center py-3 px-4">
                    {item.title}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item?.sender?.id}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item?.sender?.name}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {new Date(
                      item.receive_date
                    ).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "Pending"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {item?.receiver?.name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination className="flex justify-center items-center gap-4">
          <PaginationContent className="flex gap-2">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(currentPage - 1)}
                className="text-green-500 hover:text-green-700">
                Previous
              </PaginationPrevious>
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
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
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
                className="text-green-500 hover:text-green-700">
                Next
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div className="hidden w-1/3 md:flex flex-col gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-300">
          <div className="text-lg font-semibold text-gray-700 mb-4">
            Status Overview
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col items-center justify-center bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg py-6 shadow-md'>
              <div className='text-xl font-semibold'>Pending</div>
              <div className='text-lg font-normal'>{countPending}</div>
            </div>
            <div className='flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg py-6 shadow-md'>
              <div className='text-xl font-semibold'>Resolved</div>
              <div className='text-lg font-normal'>{countResolved}</div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-300">
          <div className="text-lg font-semibold text-gray-700 mb-4">
            Summary
          </div>
          <div className='flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-700 text-white rounded-lg py-6 shadow-md'>
            <div className='text-xl font-semibold'>Sum of Opinions</div>
            <div className='text-lg font-normal'>{countPending+countResolved}</div>
          </div>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 w-full h-full z-10 -left-10 flex justify-center items-center transition-transform">
          <Feedback
            handleClose={handleClose}
            content={currentContent}
            feedback={currentFeedback}
            opinion={selected}
          />
        </div>
      )}
    </div>
  );
};

export default OpinionPage;
