import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import React, { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormLine from "../../../components/SmallForm/FormLine";

import { useSearchParams } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import FormIncentives from "@/components/SmallForm/FormIncentives";
import * as IncentivesService from "@/services/incentivesService";
import * as Message from "@/components/ui/alert";
import { useMutation } from "react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const IncentivesPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const ITEMS_PER_PAGE = 10;
  const [items, setItems] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const [selected, setSelected] = useState("");

  const mutationGetAll = useMutation({
    mutationFn: async () => {
      return await IncentivesService.getAllIncentives();
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
    mutationFn: async (data) => {
      return await IncentivesService.deleteIncentives(data);
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

  useEffect(() => {
    mutationGetAll.mutate();
  }, [refresh]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const currentItems = items
    .filter((item) =>
      item.employee.name.toLowerCase().includes(searchWord.toLowerCase())
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

  const [showForm, setShowForm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");

  const handleAddClick = () => {
    setDialogType("add");
    setShowForm(true);
    setShowDialog(false);
  };

  const handleEditClick = () => {
    setDialogType("edit");
    setShowForm(true);
    setShowDialog(false);
  };

  const handleDialogOpen = (type) => {
    setDialogType(type);
    setShowDialog(true);
    setShowForm(false);
  };

  const handleClose = () => {
    setShowForm(false);
    setShowDialog(false);
    setRefresh(!refresh);
  };

  const handleDelete = (incentives) => {
    mutationDelete.mutate({ data: incentives });
    handleClose();
  };

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div className='flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4'>
      <div className='flex w-full space-x-6'>
        <div className='flex-1 w-full space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
          <div className='flex items-center gap-4'>
            <Search
              className='flex-grow border border-gray-300 rounded-lg p-2'
              onChange={handleSearchChanged}
              text='Type employee name...'
            />
            <Button onClick={handleAddClick} className='flex-shrink-0'>
              +
            </Button>
          </div>
          <div className='overflow-x-auto rounded-lg bg-white shadow-md'>
            <Table className='overflow-hidden rounded-t-lg border border-gray-300'>
              <TableHeader className='bg-green-500 rounded-t-lg pointer-events-none'>
                <TableRow>
                  {[
                    "ID",
                    "Name",
                    "Type",
                    "Content",
                    "Date",
                    "Price",
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
                      <TableRow key={index} onClick={() => setSelected(item)}>
                        <TableCell className='text-center py-3 px-4'>
                          {item.id}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {item.employee.name}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          <span
                            className={`px-3 py-1 mx-2 w-full rounded-full text-xs font-medium ${
                              item.type === "Reward"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}>
                            {item.type}
                          </span>
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {item.content}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {new Date(item.date).toLocaleDateString("en-GB")}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {item.price}
                        </TableCell>
                        <TableCell className='text-center flex justify-center items-center py-3 px-4'>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <EllipsisVertical className='mb-2 ' />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setId(item.id);
                                  setName(item.employee.name);
                                  setType(item.type);
                                  setContent(item.content);
                                  setDate(item.date);
                                  setPrice(item.price);
                                  handleEditClick();
                                }}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDialogOpen("delete")}>
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
          {showForm && dialogType == "add" && (
            <div className='fixed inset-0 w-full h-full z-10 flex justify-center items-center transition-transform'>
              <FormIncentives handleClose={handleClose} isAdd='true' />
            </div>
          )}
          {showForm && dialogType == "edit" && (
            <div className='fixed inset-0 w-full h-full z-10 flex justify-center items-center transition-transform'>
              <FormIncentives
                handleClose={handleClose}
                isAdd='false'
                incentives={selected}
              />
            </div>
          )}
          {/* Hiển thị Dialog khi showDialog là true */}
          {showDialog && dialogType == "delete" && (
            <Dialog open={showDialog} onOpenChange={handleClose}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className='text-center'>
                    Are you sure you want to delete?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    the incentives.
                  </DialogDescription>
                  <div className='flex items-center justify-center gap-2 pt-4'>
                    <Button
                      variant='outline'
                      className='w-[120px]'
                      onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      variant='destructive'
                      className='w-[120px]'
                      onClick={() => handleDelete(selected)}>
                      Confirm
                    </Button>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};
export default IncentivesPage;
