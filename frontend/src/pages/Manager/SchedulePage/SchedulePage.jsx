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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "react-query";
import { convertMinutesToHoursAndMinutes } from "@/utils/translateToVND";
import * as ScheduleService from "@/services/scheduleService";
import * as Message from "@/components/ui/alert";
import { format } from "date-fns";
import dayjs from "dayjs";

const SchedulePage = () => {
  const ITEMS_PER_PAGE = 10;
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const [refresh, setRefresh] = useState(false);
  const [selected, setSelected] = useState("");
  const [date, setDate] = useState(new Date());
  const [rawItems, setRawItems] = useState([]);

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
    setRefresh(!refresh);
    setShowForm(false);
    setShowDialog(false);
  };

  const handleDelete = () => {
    mutationDelete.mutate(selected._id);
    setShowForm(false);
    setShowDialog(false);
  };

  const handleApproveAll = () => {
    mutationApproveAll.mutate();
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate); // Cập nhật ngày
    setCurrentPage(1); // Chuyển về trang đầu
  };

  const filteredItems = items.filter((item) => {
    const matchesDate =
      date === null || dayjs(item.date).startOf("day").isSame(date);
    const matchesSearch = item.line.name
      .toLowerCase()
      .includes(searchWord.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const currentItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handleSearchChanged = (e) => {
    setSearchWord(e.target.value);
    setCurrentPage(1);
  };

  const mutationGetAll = useMutation({
    mutationFn: () => ScheduleService.getAllSchedule(),
    onSuccess: (data) => {
      setRawItems(data.data);
    },
    onError: (error) => {
      console.error("Error fetching schedules:", error);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: (id) => ScheduleService.deleteSchedule(id),
    onSuccess: (data) => {
      Message.success(data.message);
      setRefresh(!refresh);
    },
    onError: (error) => {
      console.error("Error deleting schedule:", error);
    },
  });

  const mutationApproveAll = useMutation({
    mutationFn: () => ScheduleService.approveAllSchedule(),
    onSuccess: (data) => {
      Message.success(data.message);
      setRefresh(!refresh);
    },
    onError: (error) => {
      console.error("Error approving schedule:", error);
    },
  });

  useEffect(() => {
    const today = dayjs().startOf("day");
    setDate(today.toDate());

    mutationGetAll.mutate();
  }, [refresh]);

  useEffect(() => {
    // Lọc dữ liệu dựa trên ngày và từ khóa tìm kiếm
    const today = dayjs(date).startOf("day");
    const filteredSchedules = rawItems.filter((item) => {
      const matchesDate = dayjs(item.date).isSame(today, "day");
      const matchesSearch = item.line.name
        .toLowerCase()
        .includes(searchWord.toLowerCase());
      return matchesDate && matchesSearch;
    });
    setItems(filteredSchedules);
  }, [date, searchWord, rawItems]);

  const allNotPending = items.every(
    (schedule) => schedule.status !== "Pending"
  );
  const [startPage, setStartPage] = useState(1);
  const maxPages = 6; // Số trang tối đa hiển thị cùng lúc

  return (
    <div className="flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4">
      <div className="flex-1 w-full space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300">
        <div className="flex items-center flex-col xl:flex-row gap-4">
          <Search
            className=" border border-gray-300 rounded-lg p-2"
            onChange={handleSearchChanged}
            text="Type line id..."
          />

          <div className="flex gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="text-left font-normal">
                  {date ? format(date, "PPP") : "Pick a date"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange} // Cập nhật giá trị khi chọn ngày mới
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleApproveAll} disabled={allNotPending}>
              Approve All
            </Button>
            <Button onClick={handleAddClick} className="">
              +
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-md">
          <Table className="overflow-hidden rounded-t-lg ">
            <TableHeader className="bg-green-500 rounded-t-lg pointer-events-none">
              <TableRow>
                {[
                  "Schedule ID",
                  "Bus",
                  "Line",
                  "Driver",
                  "Bus boy",
                  "Time start",
                  "Time",
                  "Ticket 3k",
                  "Ticket 7k",
                  "Status",
                  "Action",
                ].map((header, idx) => (
                  <TableHead
                    key={idx}
                    className="text-center text-white text-base py-3 px-4">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item, index) => (
                <TableRow
                  key={index}
                  onClick={() => setSelected(item)}
                  className={`${
                    item?.bus?.status !== "Active" ||
                    item?.driver?.status !== "Enable" ||
                    item?.busboy?.status !== "Enable"
                      ? "bg-red-100 hover:bg-red-300" // Màu nền cảnh báo và màu khi hover
                      : "hover:bg-gray-100" // Màu nền khi hover nếu không có cảnh báo
                  }`}>
                  <TableCell className="text-center py-3 px-4">
                    {item.id}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {item?.bus?.license_plate}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {item?.line?.name}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {item?.driver?.name}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {item?.busboy?.name}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {item.time_start}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {convertMinutesToHoursAndMinutes(item.line.time)}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {item.ticket3}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {item.ticket7}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    <span
                      className={`px-3 py-1 mx-2 w-full rounded-full text-xs font-medium ${
                        item.status === "Pending"
                          ? "bg-red-100 text-red-600"
                          : item.status === "Not start yet"
                          ? "bg-yellow-100 text-orange-600"
                          : item.status === "In Progress"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}>
                      {item.status}
                    </span>
                  </TableCell>
                  {item.status === "Pending" && (
                    <TableCell className="text-center flex justify-center items-center py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <EllipsisVertical className="mb-2 " />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditClick()}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDialogOpen("delete")}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination className="flex justify-center items-center gap-4">
          <PaginationContent className="flex gap-2">
            <PaginationItem>
              {startPage > 1 && (
                <PaginationPrevious
                  href="#"
                  onClick={() => setStartPage(startPage - maxPages)}
                  className="text-green-500 hover:text-green-700">
                  Previous
                </PaginationPrevious>
              )}
            </PaginationItem>
            {Array.from(
              { length: Math.min(maxPages, totalPages - startPage + 1) },
              (_, index) => startPage + index
            ).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-full transition ${
                    page === currentPage
                      ? "bg-green-500 text-white"
                      : "hover:bg-gray-200"
                  }`}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              {startPage + maxPages <= totalPages && (
                <PaginationNext
                  href="#"
                  onClick={() => setStartPage(startPage + maxPages)}
                  className="text-green-500 hover:text-green-700">
                  Next
                </PaginationNext>
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {showForm && (
          <div className="fixed inset-0 w-full h-full z-10 flex justify-center items-center transition-transform">
            {dialogType === "add" && (
              <FormSchedule handleClose={handleClose} isAdd="true" />
            )}
            {dialogType === "edit" && selected?.status === "Pending" && (
              <FormSchedule
                handleClose={handleClose}
                isAdd="false"
                schedule={selected}
              />
            )}
          </div>
        )}

        {showDialog && dialogType === "delete" && (
          <Dialog open={showDialog} onOpenChange={handleClose}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center">
                  Are you sure you want to delete?
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  schedule.
                </DialogDescription>
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="w-[120px]"
                    onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-[120px]"
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
  );
};

export default SchedulePage;
