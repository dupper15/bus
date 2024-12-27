import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useMutation } from "react-query";
import * as RequestService from "@/services/requestService";
import { useSearchParams } from "react-router-dom";
import * as Message from "../../../components/ui/alert";

const ManageRequestPage = () => {
  const ITEMS_PER_PAGE = 10;
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const currentItems = items
    .filter((item) =>
      item.title.toLowerCase().includes(searchWord.toLowerCase())
    )
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page });
    }
  };
  const { mutate: fetchRequests } = useMutation(
    RequestService.getRequestNoCondition,
    {
      onSuccess: (data) => {
        setItems(data.data);
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Failed to fetch requests:", error);
        setIsLoading(false);
      },
    }
  );
  const { mutate } = useMutation(RequestService.deleteRequest, {
    onSuccess: () => {
      fetchRequests();
      Message.success("Request deleted successfully.");
    },
    onError: (error) => {
      Message.error("Failed to delete request:", error.message || error);
      setIsLoading(false);
    },
  });

  // Sử dụng mutate để gọi hàm xóa
  const handleDelete = (id) => {
    mutate(id);
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearchChanged = (e) => {
    setSearchWord(e.target.value);
    setSearchParams({ page: 1 });
  };

  return (
    <div className='flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4'>
      <div className='flex w-full space-x-6'>
        <div className='flex-1 basis-2/3 space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
          <div className='flex items-center gap-4'>
            <Search
              className='flex-grow border border-gray-300 rounded-lg p-2'
              onChange={handleSearchChanged}
              text='Search by title...'
            />
          </div>
          {isLoading ? (
            <div className='flex justify-center items-center h-64'>
              <p>Loading...</p>
            </div>
          ) : (
            <div className='overflow-x-auto rounded-lg bg-white shadow-md'>
              <Table className='overflow-hidden rounded-t-lg border border-gray-300'>
                <TableHeader className='bg-green-500 rounded-t-lg pointer-events-none'>
                  <TableRow>
                    {[
                      "Request ID",
                      "Title",
                      "Content",
                      "Sender",
                      "Sent At",
                      "Status",
                      "Receiver",
                      "Feedback",
                      "Feedback Sent At",
                      "Action",
                    ].map((header, idx) => (
                      <TableHead
                        key={idx}
                        className='text-center text-white text-base py-3 px-4'>
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className='text-center py-3 px-4'>
                        {item.id}
                      </TableCell>
                      <TableCell className='text-center py-3 px-4'>
                        {item.title}
                      </TableCell>
                      <TableCell className='text-center py-3 px-4'>
                        {item.content}
                      </TableCell>
                      <TableCell className='text-center py-3 px-4'>
                        {item.sender}
                      </TableCell>
                      <TableCell className='text-center py-3 px-4'>
                        {item.date_requested}
                      </TableCell>
                      <TableCell className='text-center py-3 px-4'>
                        <span
                          className={`px-3 py-1 mx-2 w-full rounded-full text-xs font-medium ${
                            item.status === "Rejected"
                              ? "bg-red-100 text-red-600"
                              : item.status === "Pending"
                              ? "bg-yellow-100 text-orange-600"
                              : "bg-green-100 text-green-600"
                          }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className='text-center py-3 px-4'>
                        {item.manager}
                      </TableCell>
                      <TableCell className='text-center py-3 px-4'>
                        {item.feedback}
                      </TableCell>
                      <TableCell className='text-center py-3 px-4'>
                        {item.updatedAt}
                      </TableCell>
                      <TableCell className='text-center flex justify-center items-center my-auto px-4'>
                        <DropdownMenu>
                          <DropdownMenuTrigger className='my-auto'>
                            <EllipsisVertical className='mb-2' />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item._id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <Pagination className='flex justify-center items-center gap-4'>
            <PaginationContent className='flex gap-2'>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className='text-green-500 hover:text-green-700'>
                  Previous
                </PaginationPrevious>
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  className='text-green-500 hover:text-green-700'>
                  Next
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default ManageRequestPage;
