import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import React, { useCallback, useEffect, useState } from "react";
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
import LineService from "@/services/LineService.js";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { success, error } from "@/components/ui/alert.jsx";
import { convertMinutesToHoursAndMinutes } from "@/utils/translateToVND.js";

const LinePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const ITEMS_PER_PAGE = 10;
  const [lines, setLines] = useState([]);
  const [filteredLines, setFilteredLines] = useState([]);
  const [startPlaceWord, setStartPlaceWord] = useState("");
  const [endPlaceWord, setEndPlaceWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [selectedLine, setSelectedLine] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const currentPage = parseInt(searchParams.get("page")) || 1;

  // Fetch lines data
  const fetchLines = useCallback(async () => {
    try {
      const response = await LineService.getLines();
      const rawLines = response.data;
      const transformedLines = rawLines.map((line) => ({
        ...line,
        start_place: {
          _id: line.start_place?._id || "_",
          name: line.start_place?.name || "_",
          pointX: line.start_place?.pointX || "_",
          pointY: line.start_place?.pointY || "_",
        },
        end_place: {
          _id: line.end_place?._id || "_",
          name: line.end_place?.name || "_",
          pointX: line.end_place?.pointX || "_",
          pointY: line.end_place?.pointY || "_",
        },
        arr_stop: Array.isArray(line.arr_stop)
          ? line.arr_stop.map((stop) => ({
              _id: stop?._id || "_",
              name: stop?.name || "_",
              pointX: stop?.pointX || "_",
              pointY: stop?.pointY || "_",
            }))
          : [],
      }));

      setLines(transformedLines);
      setFilteredLines(transformedLines);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching lines:", error);
    }
  }, []);

  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  // Filter lines based on search
  useEffect(() => {
    const filtered = lines.filter((line) => {
      const startMatch = line.start_place?.name
        ?.toLowerCase()
        .includes(startPlaceWord.toLowerCase());

      const endMatch = line.end_place?.name
        ?.toLowerCase()
        .includes(endPlaceWord.toLowerCase());

      // Xác định điều kiện status
      const lineStatus = line.status || "published"; // nếu không có, mặc định là published

      const statusMatch = statusFilter === "all" || lineStatus === statusFilter;

      return startMatch && endMatch && statusMatch;
    });

    setFilteredLines(filtered);
  }, [startPlaceWord, endPlaceWord, lines, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLines.length / ITEMS_PER_PAGE);
  const currentItems = filteredLines.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page.toString() });
    }
  };

  // Form handlers
  const handleAddClick = () => {
    setDialogType("add");
    setSelectedLine(null);
    setShowForm(true);
    setShowDialog(false);
  };

  const handleEditClick = (line) => {
    setDialogType("edit");
    setSelectedLine(line);
    setShowForm(true);
    setShowDialog(false);
  };

  const handleDeleteClick = (line) => {
    setSelectedLine(line);
    setDialogType("delete");
    setShowDialog(true);
    setShowForm(false);
  };
  const getId = (index, currentPage) => {
    const calculatedIndex = (currentPage - 1) * 10 + index;
    if (calculatedIndex < 10) return "L00" + calculatedIndex;
    else if (calculatedIndex < 100) return "L0" + calculatedIndex;
    else return "L" + calculatedIndex;
  };
  const handleFormSubmit = async (values) => {
    try {
      if (dialogType === "add") {
        const response = await LineService.createLine(values);
        if (response.status === "OK") {
          success("Line created successfully");
        } else {
          error(response.message || "Failed to create line");
        }
      } else {
        const response = await LineService.updateLine(selectedLine._id, values);
        if (response.status === "OK") {
          success("Line updated successfully");
        } else {
          error(response.message || "Failed to update line");
        }
      }
      await fetchLines();
      setShowForm(false);
    } catch (err) {
      error("An error occurred while processing your request");
      console.error("Error submitting line:", err);
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedLine?._id) {
        error("Invalid line selected for deletion");
        return;
      }

      const response = await LineService.deleteLine(selectedLine._id);
      if (response.status === "OK") {
        success("Line deleted successfully");
        await fetchLines();
        setShowDialog(false);
      } else {
        error(response.message || "Failed to delete line");
      }
    } catch (err) {
      error("An error occurred while deleting the line");
      console.error("Error deleting line:", err);
    }
  };

  return (
    <div className='flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4'>
      <div className='flex w-full space-x-6'>
        <div className='flex-1 w-full space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
          <div className='flex items-center gap-4'>
            <Search
              className='flex-grow'
              onChange={(e) => setStartPlaceWord(e.target.value)}
              text='Search start place...'
            />
            <Search
              className='flex-grow'
              onChange={(e) => setEndPlaceWord(e.target.value)}
              text='Search end place...'
            />

            <select
              className='border rounded px-2 py-1 text-sm'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value='all'>All</option>
              <option value='published'>Published</option>
              <option value='draft'>Draft</option>
            </select>

            <Button onClick={handleAddClick} className='flex-shrink-0'>
              +
            </Button>
          </div>

          <div className='overflow-x-auto rounded-lg bg-white shadow-md'>
            <Table className='w-full border border-gray-300'>
              <TableHeader className='bg-green-500'>
                <TableRow>
                  {[
                    "Id",
                    "Name",
                    "Start Place",
                    "End Place",
                    "Time",
                    "Action",
                  ].map((header, idx) => (
                    <TableHead
                      key={idx}
                      className='text-center text-white text-sm py-2 px-3'>
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
                        </TableRow>
                      ))
                  : currentItems.map((line, index) => (
                      <TableRow key={line._id} className='hover:bg-gray-100'>
                        <TableCell className='text-sm text-center py-2 px-3'>
                          {getId(index + 1, currentPage)}
                        </TableCell>
                        <TableCell className='text-sm text-center py-2 px-3'>
                          {line.name}
                        </TableCell>
                        <TableCell className='text-sm text-center py-2 px-3'>
                          {line.start_place.name}
                        </TableCell>
                        <TableCell className='text-sm text-center py-2 px-3'>
                          {line.end_place.name}
                        </TableCell>
                        <TableCell className='text-sm text-center py-2 px-3'>
                          {convertMinutesToHoursAndMinutes(line.time)}
                        </TableCell>
                        <TableCell className='text-sm text-center py-2 px-3'>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <EllipsisVertical />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => handleEditClick(line)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(line)}>
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
          {showForm && (
            <div className='fixed inset-0 w-full z-10 flex justify-center items-center transition-transform'>
              <FormLine
                isAdd={dialogType === "add"}
                handleClose={() => setShowForm(false)}
                initialData={selectedLine}
                onSubmit={handleFormSubmit}
              />
            </div>
          )}
          {/* Hiển thị Dialog khi showDialog là true */}
          {showDialog && dialogType == "delete" && (
            <Dialog open={showDialog} onOpenChange={() => setShowDialog(false)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className='text-center'>
                    Are you sure you want to delete?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    the schedule.
                  </DialogDescription>
                  <div className='flex items-center justify-center gap-2 pt-4'>
                    <Button
                      variant='outline'
                      className='w-[120px]'
                      onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant='destructive'
                      className='w-[120px]'
                      onClick={handleDelete}>
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
export default LinePage;
