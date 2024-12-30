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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useMutation } from "react-query";
import * as RequestService from "@/services/requestService";
import { useSearchParams } from "react-router-dom";
import * as Message from "../../../components/ui/alert";
import { use } from "react";
import FormRequest from "@/components/SmallForm/FormRequest";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ClipLoader } from "react-spinners";
const ManageRequestPage = () => {
  const ITEMS_PER_PAGE = 10;
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState("");
  const [type, setType] = useState("");

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
  const mutaionGetAll = useMutation({
    mutationFn: () => RequestService.getRequestNoCondition(),
    onSuccess: (data) => {
      setItems(data.data);
      setIsLoading(false);
    },
    onError: (error) => {
      console.log(error);
      setIsLoading(false);
    },
  });

  const mutationDelele = useMutation({
    mutationFn: (id) => RequestService.deleteRequest(id),
    onSuccess: () => {
      Message.success("Request deleted successfully.");
      setRefresh(!refresh);
      setLoading(false);
    },
    onError: (error) => {
      Message.error("Failed to delete request:", error.message || error);
      setLoading(false);
    },
  });
  const handleClose = () => {
    setShowForm(false);
  };

  // Sử dụng mutate để gọi hàm xóa
  const handleDelete = () => {
    setLoading(true);
    mutationDelele.mutate(selected._id);
  };

  useEffect(() => {
    mutaionGetAll.mutate();
  }, [refresh]);

  const handleSearchChanged = (e) => {
    setSearchWord(e.target.value);
    setSearchParams({ page: 1 });
  };

  return (
    <div className='flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4'>
      <div className='flex w-full space-x-6'>
        <div className='flex-1 w-full space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
          <div className='flex items-center gap-4'>
            <Search
              className='flex-grow border border-gray-300 rounded-lg p-2'
              onChange={handleSearchChanged}
              text='Search by title...'
            />
          </div>

          <div className='overflow-x-auto rounded-lg bg-white shadow-md'>
            <Table className='overflow-hidden rounded-t-lg border border-gray-300'>
              <TableHeader className='bg-green-500 rounded-t-lg pointer-events-none'>
                <TableRow>
                  {[
                    "Request ID",
                    "Title",
                    "Sender",
                    "Sent At",
                    "Status",
                    "Receiver",
                    "Resolve at",
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
                {isLoading
                  ? Array(5)
                      .fill()
                      .map((_, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Skeleton height={20} width='50%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton circle={true} height={40} width={40} />
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
                          <TableCell>
                            <Skeleton height={20} width='30%' />
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
                        }}>
                        <TableCell
                          onClick={() => {
                            setType("view");
                          }}
                          className='text-center font-semibold py-3 px-4'>
                          {item.id}
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            setType("view");
                          }}
                          className='text-center font-semibold py-3 px-4'>
                          {item.title}
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            setType("view");
                          }}
                          className='text-center py-3 px-4'>
                          {item?.employee?.name}
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            setType("view");
                          }}
                          className='text-center py-3 px-4'>
                          {new Date(item.date_requested).toLocaleDateString(
                            "en-GB"
                          )}
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            setType("view");
                          }}
                          className='text-center py-3 px-4'>
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
                        <TableCell
                          onClick={() => {
                            setType("view");
                          }}
                          className='text-center py-3 px-4'>
                          {item?.manager?.name}
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            setType("view");
                          }}
                          className='text-center py-3 px-4'>
                          {new Date(item.date_resolved).toLocaleDateString(
                            "en-GB"
                          )}
                        </TableCell>
                        <TableCell className='text-center flex justify-center items-center py-3 px-4'>
                          <Dialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <EllipsisVertical className='text-gray-500 hover:text-gray-700 transition' />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                onClick={(e) => e.stopPropagation()}
                                className='bg-white shadow-md rounded-lg'>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem>
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <DialogContent className='p-4'>
                              <DialogHeader>
                                <DialogTitle className='text-center text-lg font-semibold'>
                                  Are you sure you want to delete?
                                </DialogTitle>
                                <DialogDescription className='text-gray-600'>
                                  This action cannot be undone. This will
                                  permanently delete the request and remove your
                                  data from our servers.
                                </DialogDescription>
                                <div className='flex items-center justify-center gap-4 pt-4'>
                                  <DialogClose asChild>
                                    <Button
                                      onClick={(e) => e.stopPropagation()}
                                      variant='outline'
                                      className='w-28 '>
                                      Cancel
                                    </Button>
                                  </DialogClose>
                                  <DialogClose asChild>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowForm(false);
                                        handleDelete();
                                      }}
                                      className='w-28'
                                      variant='destructive'>
                                      Confirm
                                    </Button>
                                  </DialogClose>
                                </div>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
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
      {showForm && type === "view" && (
        <div className='fixed inset-0 w-full h-full z-10 -left-10 flex justify-center items-center transition-transform'>
          <FormRequest handleClose={handleClose} request={selected} />
        </div>
      )}
    </div>
  );
};

export default ManageRequestPage;
