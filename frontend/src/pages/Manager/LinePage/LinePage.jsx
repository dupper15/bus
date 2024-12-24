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

const items = [
  {
    id: "L001",
    name: "01",
    start_place: "võ văn ngân",
    end_place: "nguyễn thị minh khai",
    time: "1 tiếng 15p",
  },
  {
    id: "L002",
    name: "02",
    start_place: "Tân Sơn Nhất",
    end_place: "Bến Thành",
    time: "45 phút",
  },
  {
    id: "L003",
    name: "03",
    start_place: "Bến Thành",
    end_place: "Chợ Lớn",
    time: "1 tiếng",
  },
  {
    id: "L004",
    name: "04",
    start_place: "Chợ Lớn",
    end_place: "Gò Vấp",
    time: "1 tiếng 20 phút",
  },
  {
    id: "L005",
    name: "05",
    start_place: "Bình Thạnh",
    end_place: "Quận 7",
    time: "50 phút",
  },
];

const LinePage = () => {
  const ITEMS_PER_PAGE = 10;
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const currentItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(searchWord.toLowerCase())
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
  };
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [start_place, setStart_place] = useState("");
  const [end_place, setEnd_place] = useState("");
  const [time, setTime] = useState("");
  return (
    <div className="flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4">
      <div className="flex w-full space-x-6">
        <div className="flex-1 basis-2/3 space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300">
          <div className="flex items-center gap-4">
            <Search
              className="flex-grow border border-gray-300 rounded-lg p-2"
              onChange={handleSearchChanged}
              text="Type start place..."
            />
            <Search
              className="flex-grow border border-gray-300 rounded-lg p-2"
              onChange={handleSearchChanged}
              text="Type end place..."
            />
            <Button onClick={handleAddClick} className="flex-shrink-0">
              +
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <Table className="overflow-hidden rounded-t-lg border border-gray-300">
              <TableHeader className="bg-green-500 rounded-t-lg pointer-events-none">
                <TableRow>
                  {[
                    "Id",
                    "Name",
                    "Start place",
                    "End place",
                    "Time",
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
                  <TableRow key={index}>
                    <TableCell className="text-center py-3 px-4">
                      {item.id}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.start_place}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.end_place}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.time}
                    </TableCell>
                    <TableCell className="text-center flex justify-center items-center py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <EllipsisVertical className="mb-2 " />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              setId(item.id);
                              setName(item.name);
                              setStart_place(item.start_place);
                              setEnd_place(item.end_place);
                              setTime(item.time);
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
          <Pagination className="flex justify-center items-center gap-4">
            <PaginationContent className="flex gap-2">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="text-green-500 hover:text-green-700">
                  Previous
                </PaginationPrevious>
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
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
                  href="#"
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="text-green-500 hover:text-green-700">
                  Next
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          {showForm && dialogType == "add" && (
            <div className="fixed inset-0 w-full h-full z-10 flex justify-center items-center transition-transform">
              <FormLine handleClose={handleClose} isAdd="true" />
            </div>
          )}
          {showForm && dialogType == "edit" && (
            <div className="fixed inset-0 w-full h-full z-10 flex justify-center items-center transition-transform">
              <FormLine
                handleClose={handleClose}
                isAdd="false"
                id={id}
                name={name}
                start_place={start_place}
                end_place={end_place}
                time={time}
              />
            </div>
          )}
          {/* Hiển thị Dialog khi showDialog là true */}
          {showDialog && dialogType == "delete" && (
            <Dialog open={showDialog} onOpenChange={handleClose}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center">
                    Are you sure you want to delete?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    the schedule.
                  </DialogDescription>
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="w-[120px]"
                      onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button className="w-[120px]" onClick={handleClose}>
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
