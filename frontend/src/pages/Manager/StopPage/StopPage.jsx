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
import { FaRegCalendarMinus } from "react-icons/fa";
import FormStop from "../../../components/SmallForm/FormStop";
import avatar from "../../../assets/default-profile-icon.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    id: "BS001",
    name: "Dormitory B",
    address: "HCMC",
    pointX: "50",
    pointY: "50",
    isStation: "true",
  },
  {
    id: "BS002",
    name: "Dormitory A",
    address: "Hanoi",
    pointX: "60",
    pointY: "70",
    isStation: "false",
  },
  {
    id: "BS003",
    name: "Station X",
    address: "Da Nang",
    pointX: "40",
    pointY: "80",
    isStation: "true",
  },
];

const StopPage = () => {
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
  const [address, setAddress] = useState("");
  const [pointX, setPointX] = useState("");
  const [pointY, setPointY] = useState("");
  const [isStation, setIsStation] = useState("");
  return (
    <div className="flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4">
      <div className="flex w-full space-x-6">
        <div className="flex-1 basis-2/3 space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300">
          <div className="flex items-center gap-4">
            <Search
              className="flex-grow border border-gray-300 rounded-lg p-2"
              onChange={handleSearchChanged}
              text="Search by name..."
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
                    "Bus ID",
                    "Name",
                    "Address",
                    "Point X",
                    "Point Y",
                    "Is Station",
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
                      {item.address}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.pointX}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.pointY}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.isStation === "true" ? "Yes" : "No"}
                    </TableCell>
                    <TableCell className="text-center flex justify-center items-center py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <EllipsisVertical className="mb-2 " />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              setId(item.type);
                              setName(item.manufacture_year);
                              setAddress(item.image);
                              setPointX(item.license_plate);
                              setPointY(item.count_seat);
                              setIsStation(item.status);
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
              <FormStop handleClose={handleClose} isAdd="true" />
            </div>
          )}
          {showForm && dialogType == "edit" && (
            <div className="fixed inset-0 w-full h-full z-10 flex justify-center items-center transition-transform">
              <FormStop
                handleClose={handleClose}
                isAdd="false"
                id={id}
                name={name}
                address={address}
                pointX={pointX}
                pointY={pointY}
                isStation={isStation}
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

export default StopPage;
