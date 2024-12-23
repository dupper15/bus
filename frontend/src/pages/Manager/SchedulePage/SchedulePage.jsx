import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import React, { useState } from "react";
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
} from "@/components/ui/dialog";
import { FaRegCalendarMinus } from "react-icons/fa";
import FormSchedule from "../../../components/SmallForm/FormSchedule";
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
const items = [
  {
    sId: "S001",
    bId: "B001",
    lId: "L001",
    date: "20-10-2024",
    time: "7:00:00",
    status: "Pending",
  },
  {
    sId: "S002",
    bId: "B001",
    lId: "L001",
    date: "20-10-2024",
    time: "8:00:00",
    status: "Not start yet",
  },
  {
    sId: "S003",
    bId: "B001",
    lId: "L001",
    date: "20-10-2024",
    time: "9:00:00",
    status: "Gone",
  },
  {
    sId: "S004",
    bId: "B001",
    lId: "L001",
    date: "20-10-2024",
    time: "10:00:00",
    status: "Pending",
  },
];

const SchedulePage = () => {
  const ITEMS_PER_PAGE = 10;
  const [showForm, setShowForm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const handleAddClick = () => {
    setDialogType("add");
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
  };
  const currentItems = items
    .filter((item) => item.bId.toLowerCase().includes(searchWord.toLowerCase()))
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
  return (
    <div className='flex justify-center min-h-screen w-full p-4'>
      <div className='space-y-6 w-full max-w-6xl'>
        <div className='flex items-center gap-4'>
          <Search
            className='flex-grow border border-gray-300 rounded-lg p-2'
            onChange={handleSearchChanged}
            text='Type line id...'
          />
          <Button className='flex-shrink-0'>
            <FaRegCalendarMinus />
          </Button>
          <Button onClick={handleAddClick} className='flex-shrink-0'>
            +
          </Button>
        </div>
        <div className='overflow-x-auto'>
          <Table className='overflow-hidden rounded-lg border border-gray-300 '>
            <TableHeader className='bg-green-500 rounded-t-lg pointer-events-none'>
              <TableRow>
                {[
                  "Schedule ID",
                  "Bus ID",
                  "Line ID",
                  "Driver",
                  "Bus boy",
                  "Time start",
                  "Status",
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
                    {item.sId}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.bId}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.lId}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.date}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.time}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.time}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    <span
                      className={`px-3 py-1 mx-2 w-full rounded-full text-xs font-medium ${
                        item.status === "Pending"
                          ? "bg-red-100 text-red-600"
                          : item.status === "Not start yet"
                          ? "bg-yellow-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                      }`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className='text-center flex justify-center items-center py-3 px-4'>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <EllipsisVertical className='mb-2 ' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleDialogOpen("edit")}>
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
            <FormSchedule handleClose={handleClose} isAdd='true' />
          </div>
        )}
        {showForm && dialogType == "edit" && (
          <div className='fixed inset-0 w-full h-full z-10 flex justify-center items-center transition-transform'>
            <FormSchedule handleClose={handleClose} isAdd='false' />
          </div>
        )}
        {showDialog && dialogType == "delete" && (
          <Dialog open={showDialog} onOpenChange={handleClose}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className='text-center'>
                  Are you sure you want to delete?
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  schedule.
                </DialogDescription>
                <div className='flex items-center justify-center gap-2 pt-4'>
                  <Button
                    variant='outline'
                    className='w-[120px]'
                    onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button className='w-[120px]' onClick={handleClose}>
                    Confirm
                  </Button>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
