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
import { FaRegCalendarAlt } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";

const items = [
  {
    oId: "O001",
    title: "Impolite attitude",
    cId: "C001",
    name: "John Smith",
    date: "20-10-2024",
    status: "Resolved",
  },
  {
    oId: "O002",
    title: "Impolite attitude",
    cId: "C001",
    name: "John Smith",
    date: "21-12-2024",
    status: "Pending",
  },
  {
    oId: "O003",
    title: "test",
    cId: "C001",
    name: "John Smith",
    date: "20-12-2024",
    status: "Pending",
  },
  {
    oId: "O004",
    title: "Impolite attitude",
    cId: "C001",
    name: "John Smith",
    date: "01-12-2021",
    status: "Pending",
  },
];

const OpinionPage = () => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTime, setSelectedTime] = useState("All");
  const [filteredItems, setFilteredItems] = useState(items);
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    filterItems();
  }, [selectedStatus, selectedTime, searchWord]);
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // Lưu ý: Tháng bắt đầu từ 0
  };
  const handleSearchChanged = (e) => {
    setSearchWord(e.target.value); // Cập nhật giá trị tìm kiếm
    setSearchParams({ page: 1 }); // Quay về trang đầu tiên
  };
  const filterItems = () => {
    const currentDate = new Date();
    const filtered = items.filter((item) => {
      // Filter by status
      if (selectedStatus && item.status !== selectedStatus) return false;
      if (
        searchWord &&
        !item.title.toLowerCase().includes(searchWord.toLowerCase())
      ) {
        return false;
      }
      // Filter by time
      if (selectedTime) {
        const itemDate = parseDate(item.date);

        switch (selectedTime) {
          case "Today":
            return itemDate.toDateString() === currentDate.toDateString();
          case "This Week": {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
            return itemDate >= startOfWeek && itemDate <= endOfWeek;
          }
          case "This Month": {
            return (
              itemDate.getFullYear() === currentDate.getFullYear() &&
              itemDate.getMonth() === currentDate.getMonth()
            );
          }
          case "This Year":
            return itemDate.getFullYear() === currentDate.getFullYear();
          default:
            return true; // "All Time" or unrecognized value
        }
      }

      return true;
    });

    setFilteredItems(filtered);
  };

  return (
    <div className='flex flex-row justify-center min-h-screen w-full p-6 bg-gray-100 space-x-6 py-4'>
      {/* Main Content */}
      <div className='w-2/3 space-y-6 flex flex-col bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
        {/* Search and Filter Section */}
        <div className='flex flex-wrap justify-between items-center gap-4'>
          {/* Filter by Status */}
          <div className='flex items-center gap-2 basis-1/5'>
            <label className='text-gray-700'>Status:</label>
            <select
              onChange={(e) => setSelectedStatus(e.target.value)}
              value={selectedStatus}
              className='border border-gray-300 rounded-lg px-3 py-2 text-gray-700'>
              <option value=''>All</option>
              <option value='Pending'>Pending</option>
              <option value='Resolved'>Resolved</option>
            </select>
          </div>
          <div className='basis-2/5'>
            <Search
              className=' border border-gray-300 rounded-lg p-2'
              onChange={handleSearchChanged}
              text='Type employee name...'
            />
          </div>
          {/* Filter by Time */}
          <div className='flex items-center gap-2 basis-1/5'>
            <label className='text-gray-700'>Time:</label>
            <select
              onChange={(e) => setSelectedTime(e.target.value)}
              value={selectedTime}
              className='border border-gray-300 rounded-lg px-3 py-2 text-gray-700'>
              <option value='All'>All Time</option>
              <option value='Today'>Today</option>
              <option value='This Week'>This Week</option>
              <option value='This Month'>This Month</option>
              <option value='This Year'>This Year</option>
            </select>
          </div>
        </div>

        {/* Table Section */}
        <div className='overflow-x-auto bg-white rounded-lg shadow-md border border-gray-300'>
          <Table>
            {/* Table Header */}
            <TableHeader className='bg-green-500 rounded-t-lg pointer-events-none'>
              <TableRow>
                <TableHead className='text-center text-white'>
                  Opinion ID
                </TableHead>
                <TableHead className='text-center text-white'>Title</TableHead>
                <TableHead className='text-center text-white'>
                  Customer ID
                </TableHead>
                <TableHead className='text-center text-white'>
                  Customer Name
                </TableHead>
                <TableHead className='text-center text-white'>
                  Receive Date
                </TableHead>
                <TableHead className='text-center text-white'>Status</TableHead>
                <TableHead className='text-center text-white'>
                  Receiver
                </TableHead>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {filteredItems.map((item, index) => (
                <TableRow key={index} className='hover:bg-gray-50'>
                  <TableCell className='text-center'>{item.oId}</TableCell>
                  <TableCell className='font-medium text-center'>
                    {item.title}
                  </TableCell>
                  <TableCell className='text-center'>{item.cId}</TableCell>
                  <TableCell className='text-center'>{item.name}</TableCell>
                  <TableCell className='text-center'>{item.date}</TableCell>
                  <TableCell className='text-center'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "Pending"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className='text-center'>{item.receiver}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sidebar Section */}
      <div className='hidden w-1/3 md:flex flex-col gap-6'>
        {/* Status Indicators */}
        <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
          <div className='text-lg font-semibold text-gray-700 mb-4'>
            Status Overview
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col items-center justify-center bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg py-6 shadow-md'>
              <div className='text-xl font-semibold'>Pending</div>
              <div className='text-lg font-normal'>1234</div>
            </div>
            <div className='flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg py-6 shadow-md'>
              <div className='text-xl font-semibold'>Resolved</div>
              <div className='text-lg font-normal'>1244</div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
          <div className='text-lg font-semibold text-gray-700 mb-4'>
            Summary
          </div>
          <div className='flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-700 text-white rounded-lg py-6 shadow-md'>
            <div className='text-xl font-semibold'>Sum of Opinions</div>
            <div className='text-lg font-normal'>4435</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpinionPage;
