import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import { useMutation } from "@tanstack/react-query";
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

import avatar from "../../../assets/default-profile-icon.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  DialogClose
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as EmployeeService from "../../../services/employeeService";
import * as Message from "../../../components/ui/alert"

const requests = [
  {
    id: "001",
    name: "John Doe",
    request: "Leave Application",
    dateSent: "2024-12-21",
  },
  {
    id: "002",
    name: "Jane Smith",
    request: "Salary Adjustment",
    dateSent: "2024-12-20",
  },
];
const ITEMS_PER_PAGE = 10;

const EmployeePage = () => {
  const [items, setItems] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const mutation = useMutation({
    mutationFn: () => {
      return EmployeeService.getAllEmployee();
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      setItems(data.data);
      console.log(data.data);
    },
  });
  useEffect(() => {
    getAll();
  }, [refresh]);
  const getAll = () => {
    mutation.mutate();
  };
  const mutationDelete = useMutation({
    mutationFn: ({_id }) => {
      return EmployeeService.deleteEmployee(_id);
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      console.log("data")
      if (data.status === "ERROR") {
        Message.error(data.message); // Hiển thị lỗi từ API
      } else if (data.status === "OK") {
        Message.success(data.message); // Hiển thị thông báo thành công
        setRefresh(!refresh);
      }
    },
  });

  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const navigate = useNavigate();
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const currentItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(searchWord.toLowerCase())
    )
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  // Query id employee into url
  const currentParams = new URLSearchParams(window.location.search);
  currentParams.set('id', selectedEmployee._id);
  window.history.pushState(
    {},
    '',
    `${window.location.pathname}?${currentParams.toString()}`
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page });
    }
  };

  const [add, setAdd] = useState(false);

  const handleAdd = () => {
    setAdd(!add);
    navigate("add-employee");
  };

  const handleSearchChanged = (e) => {
    setSearchWord(e.target.value);
    setSearchParams({ page: 1 });
  };
  const handleEdit = (eId) => {
    // console.log("Editing...");
    //onNavigateDetail(eId);
  };

  const handleDelete = (_id) => {
    mutationDelete.mutate({_id: _id})
  };

  return (
    <div className='flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4'>
      <div className='flex w-full space-x-6'>
        <div className='flex-1 basis-2/3 space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
          <div className='flex items-center gap-4'>
            <Search
              className='flex-grow border border-gray-300 rounded-lg p-2'
              onChange={handleSearchChanged}
              text='Type employee name...'
            />
            <Button
              onClick={handleAdd}
              className='bg-green-500 hover:bg-green-400 text-white text-2xl font-semibold px-4 py-2 rounded-lg shadow-md transition'>
              +
            </Button>
          </div>
          <div className='overflow-x-auto bg-gray-50 rounded-lg shadow-md'>
            <Table className='w-full border-collapse'>
              <TableHeader className='bg-green-500 rounded-t-lg pointer-events-none'>
                <TableRow>
                  {[
                    "Employee ID",
                    "Avatar",
                    "Name",
                    "Role",
                    "Contact",
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
              <TableBody className='divide-y divide-gray-200'>
                {currentItems.map((item, index) => (
                  <TableRow
                    key={index}
                    className='cursor-pointer hover:bg-gray-100 transition'
                    onClick={() => {
                      setSelectedEmployee(item);
                    }}>
                    <TableCell className='text-center py-3 px-4'>
                      {item.id}
                    </TableCell>
                    <TableCell className='flex justify-center items-center py-3 px-4'>
                      <Avatar className='w-10 h-10 border-2 border-green-500'>
                        <AvatarImage src={item.image ? item.image : avatar} />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className='text-center font-medium py-3 px-4'>
                      {item.name}
                    </TableCell>
                    <TableCell className='text-center py-3 px-4'>
                      {item.position}
                    </TableCell>
                    <TableCell className='text-center py-3 px-4'>
                      {item.phone}
                    </TableCell>
                    <TableCell className='text-center flex justify-center items-center py-3 px-4'>
                      <Dialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <EllipsisVertical className='text-gray-500 hover:text-gray-700 transition' />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className='bg-white shadow-md rounded-lg'>
                            <DropdownMenuItem onClick={() => handleEdit(item._id)}>
                              Edit
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
                              permanently delete your account and remove your
                              data from our servers.
                            </DialogDescription>
                            <div className='flex items-center justify-center gap-4 pt-4'>
                            <DialogClose asChild>
                              <Button variant='outline' className='w-28 '>
                                Cancel
                              </Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button  onClick={() => handleDelete(selectedEmployee._id)} className='w-28' variant="destructive">
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
        <div className='hidden md:basis-1/3 h-max md:flex justify-start items-start gap-6 flex-col'>
          <div className='w-full h-max bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
            <h2 className='text-xl font-semibold text-green-500 mb-4 text-center'>
              Employee Detail
            </h2>
            {selectedEmployee ? (
              <div className='space-y-4'>
                <Avatar className='mx-auto w-20 h-20 border-2 border-green-500'>
                  <AvatarImage
                    src={
                      selectedEmployee.image ? selectedEmployee.image : avatar
                    }
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className='flex justify-between items-center'>
                  <span className='font-medium text-gray-600'>ID:</span>
                  <span className='text-gray-800'>{selectedEmployee.id}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='font-medium text-gray-600'>Name:</span>
                  <span className='text-gray-800'>{selectedEmployee.name}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='font-medium text-gray-600'>National ID:</span>
                  <span className='text-gray-800'>{selectedEmployee.id_card}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='font-medium text-gray-600'>Gender:</span>
                  <span className='text-gray-800'>
                    {selectedEmployee.gender}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='font-medium text-gray-600'>Salary:</span>
                  <span className='text-gray-800'>
                    {selectedEmployee.salary}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='font-medium text-gray-600'>Role:</span>
                  <span className='text-gray-800'>
                    {selectedEmployee.position}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='font-medium text-gray-600'>Phone:</span>
                  <span className='text-gray-800'>
                    {selectedEmployee.phone}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='font-medium text-gray-600'>Hire date:</span>
                  <span className='text-gray-800'>
                    {new Date(selectedEmployee.hire_date).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div
                  className={`${
                    selectedEmployee.license == null ? "hidden" : "flex"
                  } justify-between items-center`}>
                  <span className='font-medium text-gray-600'>License:</span>
                  <span className='text-gray-800'>
                    {selectedEmployee.license}
                  </span>
                </div>
              </div>
            ) : (
              <p className='text-gray-500 text-center'>Select an employee</p>
            )}
          </div>
          <div className='w-full h-max bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
            <h2 className='text-xl font-semibold text-green-500 mb-4 text-center'>
              Request Details
            </h2>
            <div className='space-y-4'>
              {requests.map((request, index) => (
                <div key={index} className='flex justify-between items-center'>
                  <span className='font-medium text-gray-600'>
                    {request.name}
                  </span>
                  <span className='text-gray-800'>
                    {request.request} ({request.dateSent})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePage;
