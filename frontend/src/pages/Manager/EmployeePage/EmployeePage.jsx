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
import { FaUserEdit } from "react-icons/fa";

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
  DialogClose,
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
import * as Message from "../../../components/ui/alert";

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
    },
  });
  useEffect(() => {
    getAll();
  }, [refresh]);
  const getAll = () => {
    mutation.mutate();
  };
  const mutationDelete = useMutation({
    mutationFn: ({ _id }) => {
      return EmployeeService.deleteEmployee(_id);
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

  const mutationEdit = useMutation({
    mutationFn: ({ _id, data }) => {
      return EmployeeService.editEmployee(_id, data);
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
      return EmployeeService.changeStatus(_id);
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

  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const navigate = useNavigate();
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEmployee({ ...editedEmployee, [name]: value });
  };

  const handleCancel = () => {
    setEditedEmployee(selectedEmployee);
    setIsEditing(false);
  };

  const handleSave = () => {
    handleEdit(editedEmployee);
    setIsEditing(false);
    setSelectedEmployee("");
    setEditedEmployee("");
  };
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

  const [add, setAdd] = useState(false);

  const handleAdd = () => {
    setAdd(!add);
    navigate("add-employee");
  };

  const handleSearchChanged = (e) => {
    setSearchWord(e.target.value);
    setSearchParams({ page: 1 });
  };
  const handleEdit = (employee) => {
    mutationEdit.mutate({ _id: employee._id, data: employee });
  };

  const handleDelete = (_id) => {
    mutationDelete.mutate({ _id: _id });
  };

  const handleDisable = (_id) => {
    mutationChangeStatus.mutate({ _id: _id });
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
          <div className='overflow-x-auto rounded-lg bg-white shadow-md'>
            <Table
              className={`min-w-full  ${
                isEditing ? "pointer-events-none" : ""
              }`}>
              <TableHeader className='bg-green-500 pointer-events-none'>
                <TableRow>
                  {[
                    "ID",
                    "Avatar",
                    "Name",
                    "Role",
                    "Contact",
                    "Status",
                    "Action",
                  ].map((header, idx) => (
                    <TableHead
                      key={idx}
                      className='text-center text-white font-semibold py-4'>
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
                      setEditedEmployee(item);
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
                    <TableCell className='text-center flex justify-center items-center py-3 px-4'>
                      <Dialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <EllipsisVertical className='text-gray-500 hover:text-gray-700 transition' />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className='bg-white shadow-md rounded-lg'>
                            <DropdownMenuItem
                              onClick={() => handleDisable(item._id)}>
                              {item.status === "Disable" ? "Enable" : "Disable"}
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
                              permanently delete your employee and remove your
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
                                  onClick={() =>
                                    handleDelete(selectedEmployee._id)
                                  }
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

        <div className='hidden md:basis-1/3 h-max md:flex justify-start items-start gap-6 flex-col'>
          <div className='w-full h-max bg-white shadow-lg rounded-xl p-6 border border-gray-200'>
            <FaUserEdit
              onClick={() => setIsEditing(true)}
              className='text-green-500 hover:text-green-400 cursor-pointer'
            />
            <h2 className='text-2xl font-semibold text-green-500 mb-4 text-center'>
              Employee Detail
            </h2>

            {selectedEmployee ? (
              <div className='space-y-4'>
                <div className='flex justify-center'>
                  <Avatar className='w-24 h-24 border-4 border-green-500 shadow-xl'>
                    <AvatarImage
                      src={
                        selectedEmployee.image
                          ? selectedEmployee.image
                          : "default-avatar.jpg"
                      }
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium text-gray-600'>ID:</span>
                    <span className='text-gray-800'>{selectedEmployee.id}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium text-gray-600'>Name:</span>
                    {isEditing ? (
                      <input
                        type='text'
                        name='name'
                        value={editedEmployee.name}
                        onChange={handleInputChange}
                        className='text-gray-800 border w-2/3 p-2 rounded-md '
                      />
                    ) : (
                      <span className='text-gray-800'>
                        {selectedEmployee.name}
                      </span>
                    )}
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium text-gray-600'>
                      National ID:
                    </span>
                    {isEditing ? (
                      <input
                        type='text'
                        name='id_card'
                        value={editedEmployee.id_card}
                        onChange={handleInputChange}
                        className='text-gray-800 border p-2 rounded-md w-2/3'
                      />
                    ) : (
                      <span className='text-gray-800'>
                        {selectedEmployee.id_card}
                      </span>
                    )}
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium text-gray-600'>Gender:</span>
                    {isEditing ? (
                      <input
                        type='text'
                        name='gender'
                        value={editedEmployee.gender}
                        onChange={handleInputChange}
                        className='text-gray-800 border p-2 rounded-md w-2/3'
                      />
                    ) : (
                      <span className='text-gray-800'>
                        {selectedEmployee.gender}
                      </span>
                    )}
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium text-gray-600'>Salary:</span>
                    {isEditing ? (
                      <input
                        type='text'
                        name='salary'
                        value={editedEmployee.salary}
                        onChange={handleInputChange}
                        className='text-gray-800 border p-2 rounded-md w-2/3'
                      />
                    ) : (
                      <span className='text-gray-800'>
                        {selectedEmployee.salary}
                      </span>
                    )}
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium text-gray-600'>Role:</span>
                    {isEditing ? (
                      <input
                        type='text'
                        name='position'
                        value={editedEmployee.position}
                        onChange={handleInputChange}
                        className='text-gray-800 border p-2 rounded-md w-2/3'
                      />
                    ) : (
                      <span className='text-gray-800'>
                        {selectedEmployee.position}
                      </span>
                    )}
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium text-gray-600'>Phone:</span>
                    {isEditing ? (
                      <input
                        type='text'
                        name='phone'
                        value={editedEmployee.phone}
                        onChange={handleInputChange}
                        className='text-gray-800 border p-2 rounded-md w-2/3'
                      />
                    ) : (
                      <span className='text-gray-800'>
                        {selectedEmployee.phone}
                      </span>
                    )}
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium text-gray-600'>
                      Hire date:
                    </span>
                    {isEditing ? (
                      <input
                        type='text'
                        name='hire_date'
                        value={new Date(
                          selectedEmployee.hire_date
                        ).toLocaleDateString("en-GB")}
                        onChange={handleInputChange}
                        className='text-gray-800 border p-2 rounded-md w-2/3'
                      />
                    ) : (
                      <span className='text-gray-800'>
                        {new Date(
                          selectedEmployee.hire_date
                        ).toLocaleDateString("en-GB")}
                      </span>
                    )}
                  </div>
                  {selectedEmployee.license && (
                    <div className='flex justify-between items-center'>
                      <span className='font-medium text-gray-600'>
                        License:
                      </span>
                      {isEditing ? (
                        <input
                          type='text'
                          name='license'
                          value={editedEmployee.license}
                          onChange={handleInputChange}
                          className='text-gray-800 border p-2 rounded-md w-2/3'
                        />
                      ) : (
                        <span className='text-gray-800'>
                          {selectedEmployee.license}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className='flex justify-end gap-4 mt-6'>
                    <button
                      className='bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 transition'
                      onClick={handleCancel}>
                      Cancel
                    </button>
                    <button
                      className='bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition'
                      onClick={handleSave}>
                      Save
                    </button>
                  </div>
                )}
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
