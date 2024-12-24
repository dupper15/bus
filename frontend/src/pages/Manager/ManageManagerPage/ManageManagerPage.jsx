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
import FormManager from "../../../components/SmallForm/FormManager";
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
    id: "M001",
    name: "Luffy",
    phone: "09234",
    image:
      "https://th.bing.com/th/id/R.320477280e71dd5d55e746cbdc10ee91?rik=J9vHtZqGd2aiYA&pid=ImgRaw&r=0",
    id_card: "4323",
    status: "Active",
  },
  {
    id: "M002",
    name: "Zoro",
    phone: "09876",
    image:
      "https://th.bing.com/th/id/R.1eec83c64722e48fda6aa72bc843e255?rik=4LkZT1k0VAhVEQ&pid=ImgRaw&r=0",
    id_card: "5678",
    status: "Normal",
  },
  {
    id: "M003",
    name: "Nami",
    phone: "07654",
    image:
      "https://th.bing.com/th/id/R.c879ac7f8f5db0e2a7d5a27e62019cfb?rik=WyD3eCSYt%2fwfsA&pid=ImgRaw&r=0",
    id_card: "9876",
    status: "Inactive",
  },
  {
    id: "M004",
    name: "Sanji",
    phone: "08456",
    image:
      "https://th.bing.com/th/id/R.8c05e3f1bfc63dc4c508dcedf1644a4d?rik=l%2bYr3iZcrZMsZw&pid=ImgRaw&r=0",
    id_card: "5432",
    status: "Active",
  },
  {
    id: "M005",
    name: "Chopper",
    phone: "08321",
    image:
      "https://th.bing.com/th/id/R.5a2d6f16c626d29abf75553c6277557a?rik=UvPn4yO3XyZuyA&pid=ImgRaw&r=0",
    id_card: "1234",
    status: "Maintenance",
  },
];

const ManageManagerPage = () => {
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
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [idCard, setIdCard] = useState("");
  const [status, setStatus] = useState("");
  return (
    <div className='flex justify-center min-h-screen w-full p-4'>
      <div className='space-y-6 w-full max-w-6xl'>
        <div className='flex items-center gap-4'>
          <Search
            className='flex-grow border border-gray-300 rounded-lg p-2'
            onChange={handleSearchChanged}
            text='Type name...'
          />
          <Button onClick={handleAddClick} className='flex-shrink-0'>
            +
          </Button>
        </div>
        <div className='overflow-x-auto'>
          <Table className='overflow-hidden rounded-lg border  border-gray-300 '>
            <TableHeader className='bg-green-500 rounded-t-lg pointer-events-none'>
              <TableRow>
                {[
                  "Id",
                  "Name",
                  "Phone",
                  "Image",
                  "Id card",
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
                    {item.name}
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.phone}
                  </TableCell>
                  <TableCell className=' py-3 px-4'>
                    <Avatar className='w-10 h-10 border-2 mx-auto border-green-500'>
                      <AvatarImage src={item.image ? item.image : avatar} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className='text-center py-3 px-4'>
                    {item.id_card}
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
                            setId(item.id);
                            setName(item.name);
                            setPhone(item.phone);
                            setImage(item.image);
                            setIdCard(item.id_card);
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
            <FormManager handleClose={handleClose} isAdd='true' />
          </div>
        )}
        {showForm && dialogType == "edit" && (
          <div className='fixed inset-0 w-full h-full z-10 flex justify-center items-center transition-transform'>
            <FormManager
              handleClose={handleClose}
              isAdd='false'
              id={id}
              name={name}
              phone={phone}
              image={image}
              id_card={idCard}
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
export default ManageManagerPage;
