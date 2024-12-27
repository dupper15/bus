import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams } from "react-router-dom";
import MaintenanceDetail from "@/components/SmallForm/MaintenanceDetail";
import ex from "../../../assets/404.jpg";
import { TiTick } from "react-icons/ti";
import { CiCircleRemove } from "react-icons/ci";

const items = [
  {
    id: "REQ001",
    license_plate: "29A-12345",
    status: "Pending",
    title: "Oil Change",
    start_date: "2024-12-01",
    end_date: "2024-12-02",
    price: "$50",
    image: ex,
  },
  {
    id: "REQ002",
    license_plate: "30B-54321",
    status: "Completed",
    title: "Brake Check",
    start_date: "2024-11-28",
    end_date: "2024-11-29",
    price: "$100",
    image: ex,
  },
  {
    id: "REQ003",
    license_plate: "31C-67890",
    status: "Pending",
    title: "Tire Replacement",
    start_date: "2024-12-03",
    end_date: "2024-12-03",
    price: "$200",
    image: ex,
  },
];

const MaintenancePage = () => {
  const ITEMS_PER_PAGE = 10;
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const [currentContent, setCurrentContent] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleClose = () => {
    setShowForm(false);
  };

  const currentItems = items
    .filter((item) =>
      item.license_plate.toLowerCase().includes(searchWord.toLowerCase())
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

  const handleAction = (id, action) => {
    console.log(`${action} request with ID: ${id}`);
  };
  const [showImage, setShowImage] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const handleShowImage = (image) => {
    setCurrentImage(image);
    setShowImage(true);
  };

  const handleCloseImage = () => {
    setShowImage(false);
    setCurrentImage(null);
  };

  return (
    <div className='flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4'>
      <div className='flex w-full space-x-6'>
        <div className='flex-1 basis-2/3 space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
          <div className='flex items-center gap-4'>
            <Search
              className='flex-grow border border-gray-300 rounded-lg p-2'
              onChange={handleSearchChanged}
              text='Type license plate...'
            />
          </div>

          <div className='overflow-x-auto rounded-lg bg-white shadow-md'>
            <Table className='overflow-hidden rounded-t-lg border border-gray-300'>
              <TableHeader className='bg-green-500 pointer-events-none'>
                <TableRow>
                  <TableHead className='text-center text-white text-base py-3 px-4'>
                    Maintenance ID
                  </TableHead>
                  <TableHead className='text-center text-white text-base py-3 px-4'>
                    License Plate
                  </TableHead>
                  <TableHead className='text-center text-white text-base py-3 px-4'>
                    Status
                  </TableHead>
                  <TableHead className='text-center text-white text-base py-3 px-4'>
                    Title
                  </TableHead>
                  <TableHead className='text-center text-white text-base py-3 px-4'>
                    Start Date
                  </TableHead>
                  <TableHead className='text-center text-white text-base py-3 px-4'>
                    End Date
                  </TableHead>
                  <TableHead className='text-center text-white text-base py-3 px-4'>
                    Price
                  </TableHead>
                  <TableHead className='text-center text-white text-base py-3 px-4'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item, index) => (
                  <TableRow key={index} className='cursor-pointer'>
                    <TableCell className='text-center py-3 px-4'>
                      {item.id}
                    </TableCell>
                    <TableCell className='font-medium text-center py-3 px-4'>
                      {item.license_plate}
                    </TableCell>
                    <TableCell className='text-center py-3 px-4'>
                      {item.status}
                    </TableCell>
                    <TableCell className='text-center py-3 px-4'>
                      {item.title}
                    </TableCell>
                    <TableCell className='text-center py-3 px-4'>
                      {item.start_date}
                    </TableCell>
                    <TableCell className='text-center py-3 px-4'>
                      {item.end_date}
                    </TableCell>
                    <TableCell className='text-center py-3 px-4'>
                      {item.price}
                    </TableCell>
                    <TableCell className='text-center py-3 px-4 space-x-4 flex justify-center items-center'>
                      <button
                        className='text-sm text-blue-500 hover:underline'
                        onClick={() => handleShowImage(item.image)}>
                        Xem ảnh
                      </button>
                      <CiCircleRemove
                        className='text-4xl text-red-500 cursor-pointer hover:text-red-700 transition-colors duration-200 ease-in-out'
                        onClick={() => handleAction(item.id, "Reject")}
                      />
                      <TiTick
                        className='text-4xl text-green-500 cursor-pointer hover:text-green-700 transition-colors duration-200 ease-in-out'
                        onClick={() => handleAction(item.id, "Approve")}
                      />
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
        {showImage && (
          <div className='fixed -left-10 inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-white p-4 rounded-lg shadow-lg max-w-lg w-full'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold'>Proof</h3>
                <button
                  className='text-gray-500 hover:text-black'
                  onClick={handleCloseImage}>
                  Đóng
                </button>
              </div>
              <div className='flex justify-center items-center'>
                <img
                  src={currentImage}
                  alt='Maintenance'
                  className='max-w-full max-h-96 rounded-lg'
                />
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className='fixed inset-0 w-full h-full z-10 -left-10 flex justify-center items-center transition-transform'>
            <MaintenanceDetail
              handleClose={handleClose}
              content={currentContent}
              title={currentTitle}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;
