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
import { useMutation } from "react-query";
import { getAllManager, deleteManager } from "../../../services/managerService";
import { de } from "date-fns/locale";

const ManageManagerPage = () => {
  const ITEMS_PER_PAGE = 10;
  const [items, setItems] = useState([]);
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

  const mutationGetAll = useMutation({
    mutationFn: () => getAllManager(),
    onSuccess: (data) => {
      setItems(data.data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const mutaionDelete = useMutation({
    mutationFn: ({ data }) => deleteManager(data),
    onSuccess: (data) => {
      setItems(data.data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    getAll();
  }, []);

  const getAll = () => {
    mutationGetAll.mutate();
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

  const handleClose = (manager) => {
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
                  "ID",
                  "Name",
                  "Phone",
                  "Image",
                  "National ID",
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
            <FormManager
              handleClose={handleClose}
              isAdd='true'
              getAll={getAll}
            />
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
                  <Button
                    variant='destructive'
                    className='w-[120px]'
                    onClick={handleClose}>
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
