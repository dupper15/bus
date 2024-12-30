import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import avatar from "../../../assets/default-profile-icon.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useSearchParams } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useMutation } from "react-query";
import * as CustomerService from "../../../services/customerService";
import * as Message from "../../../components/ui/alert";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const ITEMS_PER_PAGE = 10;

const CustomerPage = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      return CustomerService.getAllCustomer();
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      setItems(data.data);
      setIsLoading(false);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: ({ _id }) => {
      return CustomerService.deleteCustomer(_id);
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      if (data.status === "ERROR") {
        Message.error(data.message); // Hiển thị lỗi từ API
      } else if (data.status === "OK") {
        Message.success(data.message); // Hiển thị thông báo thành công
        setRefresh(!refresh);
      }
    },
  });

  const mutationChangeStatus = useMutation({
    mutationFn: ({ _id }) => {
      return CustomerService.changeStatus(_id);
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      if (data.status === "ERROR") {
        Message.error(data.message); // Hiển thị lỗi từ API
      } else if (data.status === "OK") {
        Message.success(data.message); // Hiển thị thông báo thành công
        setRefresh(!refresh);
      }
    },
  });

  const handleDelete = (_id) => {
    mutationDelete.mutate({ _id: _id });
  };

  const handleDisable = (_id) => {
    mutationChangeStatus.mutate({ _id: _id });
  };

  useEffect(() => {
    getAll();
  }, [refresh]);
  const getAll = () => {
    mutation.mutate();
  };

  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const currentItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(searchWord.toLowerCase())
    )
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Query id employee into url
  const currentParams = new URLSearchParams(window.location.search);
  currentParams.set("id", selectedEmployee._id);
  window.history.pushState(
    {},
    "",
    `${window.location.pathname}?${currentParams.toString()}`
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page });
    }
  };
  const handleSearchChanged = (e) => {
    setSearchWord(e.target.value);
    setSearchParams({ page: 1 });
  };
  return (
    <div className='flex justify-center min-h-screen w-full p-6 bg-gray-100'>
      <div className='space-y-8 w-full  bg-white shadow-lg rounded-xl p-8 border border-gray-300'>
        {/* Header Section */}
        <div className='flex justify-between items-center mb-8'>
          <Search
            className='flex-grow border border-gray-300 rounded-lg p-2'
            onChange={handleSearchChanged}
            text='Type customer name...'
          />
        </div>

        {/* Table Section */}
        <div className='overflow-x-auto rounded-lg bg-white shadow-md'>
          <Table className='min-w-full'>
            <TableHeader className='bg-green-500 pointer-events-none'>
              <TableRow>
                <TableHead className='text-center text-white font-semibold py-4'>
                  ID
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  Avatar
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  Name
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  National ID
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  Contact
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  Username
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  Status
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
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
                      </TableRow>
                    ))
                : currentItems.map((item, index) => (
                    <TableRow
                      key={index}
                      className='border-b hover:bg-gray-100'>
                      <TableCell className='text-center py-4'>
                        {item.id}
                      </TableCell>
                      <TableCell className='text-center py-4'>
                        <Avatar className='mx-auto'>
                          <AvatarImage
                            src={item.avatar}
                            alt={`${item.name} avatar`}
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className='text-center font-medium py-4'>
                        {item.name}
                      </TableCell>
                      <TableCell className='text-center py-4'>
                        {item.id_card}
                      </TableCell>
                      <TableCell className='text-center py-4'>
                        {item.phone}
                      </TableCell>
                      <TableCell className='text-center py-4'>
                        {item.username}
                      </TableCell>
                      <TableCell className='text-center py-4'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === "Disable"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      {/* Action Section */}
                      <TableCell className='text-center py-4'>
                        <Dialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <EllipsisVertical className='text-gray-500 hover:text-gray-700 transition' />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='bg-white shadow-md rounded-lg'>
                              <DropdownMenuItem
                                onClick={() => handleDisable(item._id)}>
                                {item.status === "Disable"
                                  ? "Enable"
                                  : "Disable"}
                              </DropdownMenuItem>
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
                                permanently delete your customer and remove your
                                data from our servers.
                              </DialogDescription>
                              <div className='flex items-center justify-center gap-4 pt-4'>
                                <DialogClose asChild>
                                  <Button variant='outline' className='w-28 '>
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button
                                    onClick={() => handleDelete(item._id)}
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
    </div>
  );
};

export default CustomerPage;
