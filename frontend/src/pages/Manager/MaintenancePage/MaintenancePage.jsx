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
import { TiTick } from "react-icons/ti";
import { CiCircleRemove } from "react-icons/ci";
import * as BillService from "@/services/billService";
import * as Message from "@/components/ui/alert";
import { useMutation } from "react-query";
import { formatToVND } from "@/utils/translateToVND";
import { accountSlice } from "@/redux/accountSlide";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const MaintenancePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const ITEMS_PER_PAGE = 10;
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState("");

  const mutationGetAll = useMutation({
    mutationFn: async () => {
      return await BillService.getAllBill();
    },
    onSuccess: (data) => {
      setItems(data.data);
      setIsLoading(false);
    },
    onError: (error) => {
      console.log(error);
      setIsLoading(false);
    },
  });

  const mutaionResolve = useMutation({
    mutationFn: async (data) => {
      return await BillService.editBill(data);
    },
    onSuccess: () => {
      Message.success("Bill resolved successfully.");
      setRefresh(!refresh);
    },
    onError: (error) => {
      Message.error("Failed to resolve bill:", error.message || error);
    },
  });

  useEffect(() => {
    mutationGetAll.mutate();
  }, [refresh]);

  const handleClose = () => {
    setShowForm(false);
  };

  const currentItems = items
    .filter((item) =>
      item?.bus?.license_plate.toLowerCase().includes(searchWord.toLowerCase())
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
    mutaionResolve.mutate({ id: id, status: action });
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
        <div className='flex-1 w-full space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
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
                {isLoading
                  ? Array(5)
                      .fill()
                      .map((_, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Skeleton height={20} width='50%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='80%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='80%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='80%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='50%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='60%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='40%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='30%' />
                          </TableCell>
                        </TableRow>
                      ))
                  : currentItems.map((item, index) => (
                      <TableRow
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelected(item);
                          setShowForm(true);
                        }}
                        className='cursor-pointer'>
                        <TableCell className='text-center py-3 px-4'>
                          {item.id}
                        </TableCell>
                        <TableCell className='font-medium text-center py-3 px-4'>
                          {item.bus.license_plate}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.status === "Pending"
                                ? "bg-yellow-100 text-orange-600"
                                : item.status === "Rejected"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}>
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {item.title}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {new Date(item.start_date).toLocaleDateString(
                            "en-GB"
                          )}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {new Date(item.end_date).toLocaleDateString("en-GB")}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {formatToVND(item.price)}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4 space-x-4 flex justify-center items-center'>
                          <button
                            className='text-sm text-blue-500 hover:underline'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowImage(item.image);
                            }}>
                            Show image
                          </button>
                          {item.status === "Pending" && (
                            <>
                              <CiCircleRemove
                                className='text-4xl text-red-500 cursor-pointer hover:text-red-700 transition-colors duration-200 ease-in-out'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(item.id, "Rejected");
                                }}
                              />
                              <TiTick
                                className='text-4xl text-green-500 cursor-pointer hover:text-green-700 transition-colors duration-200 ease-in-out'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(item.id, "Approve");
                                }}
                              />
                            </>
                          )}
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
          <div className='fixed p-4 -left-10 inset-0  bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-white ml-2 md:ml-0 p-4  rounded-lg shadow-lg max-w-lg w-full'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold'></h3>
                <button
                  className='text-gray-500 hover:text-black'
                  onClick={handleCloseImage}>
                  Close
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
              maintenance={selected}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;
