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
import FormBus from "../../../components/SmallForm/FormBus";
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
    id: "B001",
    type: "Xe xăng",
    manufacture_year: "2015",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L3",
    count_seat: "30",
    status: "Active",
  },
  {
    id: "B002",
    type: "Xe điện",
    manufacture_year: "2020",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L4",
    count_seat: "40",
    status: "Maintenance",
  },
  {
    id: "B003",
    type: "Xe xăng",
    manufacture_year: "2018",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L5",
    count_seat: "35",
    status: "Inactive",
  },
  {
    id: "B004",
    type: "Xe xăng",
    manufacture_year: "2017",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L6",
    count_seat: "50",
    status: "Normal",
  },
  {
    id: "B005",
    type: "Xe điện",
    manufacture_year: "2022",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L7",
    count_seat: "30",
    status: "Normal",
  },
  {
    id: "B006",
    type: "Xe xăng",
    manufacture_year: "2016",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L8",
    count_seat: "45",
    status: "Normal",
  },
  {
    id: "B007",
    type: "Xe xăng",
    manufacture_year: "2019",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L9",
    count_seat: "38",
    status: "Normal",
  },
  {
    id: "B008",
    type: "Xe điện",
    manufacture_year: "2021",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L10",
    count_seat: "40",
    status: "Normal",
  },
  {
    id: "B009",
    type: "Xe xăng",
    manufacture_year: "2014",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L11",
    count_seat: "28",
    status: "Normal",
  },
  {
    id: "B010",
    type: "Xe điện",
    manufacture_year: "2023",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L12",
    count_seat: "32",
    status: "Normal",
  },
  {
    id: "B011",
    type: "Xe xăng",
    manufacture_year: "2020",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L13",
    count_seat: "55",
    status: "Normal",
  },
  {
    id: "B012",
    type: "Xe điện",
    manufacture_year: "2022",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L14",
    count_seat: "30",
    status: "Normal",
  },
  {
    id: "B013",
    type: "Xe xăng",
    manufacture_year: "2018",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L15",
    count_seat: "48",
    status: "Normal",
  },
  {
    id: "B014",
    type: "Xe điện",
    manufacture_year: "2021",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L16",
    count_seat: "42",
    status: "Normal",
  },
  {
    id: "B015",
    type: "Xe xăng",
    manufacture_year: "2019",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    license_plate: "59L17",
    count_seat: "36",
    status: "Normal",
  },
];

const BusPage = () => {
  const ITEMS_PER_PAGE = 10;
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const currentItems = items
    .filter((item) =>
      item.license_plate.toLowerCase().includes(searchWord.toLowerCase())
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
  const [type, setType] = useState("");
  const [manufactureYear, setManufactureYear] = useState("");
  const [image, setImage] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [countSeat, setCountSeat] = useState("");
  const [status, setStatus] = useState("");
  return (
    <div className='flex justify-center min-h-screen w-full p-4'>
      <div className='space-y-6 w-full max-w-6xl'>
        <div className='flex items-center gap-4'>
          <Search
            className='flex-grow border border-gray-300 rounded-lg p-2'
            onChange={handleSearchChanged}
            text='Type license plate...'
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
                  "Bus ID",
                  "Type",
                  "Manufacture year",
                  "Image",
                  "License plate",
                  "Count seat",
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
                    {item.id}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.type}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.manufacture_year}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    <Avatar className='w-10 h-10 border-2 border-green-500'>
                      <AvatarImage src={item.image ? item.image : avatar} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.license_plate}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.count_seat}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    <span
                      className={`px-3 py-1 mx-2 w-full rounded-full text-xs font-medium ${
                        item.status === "Inactive"
                          ? "bg-slate-200 text-gray-800"
                          : item.status === "Maintenance"
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
                          onClick={() => {
                            setType(item.type);
                            setManufactureYear(item.manufacture_year);
                            setImage(item.image);
                            setLicensePlate(item.license_plate);
                            setCountSeat(item.count_seat);
                            setStatus(item.status);
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
            <FormBus handleClose={handleClose} isAdd='true' />
          </div>
        )}
        {showForm && dialogType == "edit" && (
          <div className='fixed inset-0 w-full h-full z-10 flex justify-center items-center transition-transform'>
            <FormBus
              handleClose={handleClose}
              isAdd='false'
              type={type}
              manufacture_year={manufactureYear}
              image={image}
              license_plate={licensePlate}
              count_seat={countSeat}
              status={status}
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

export default BusPage;
