import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
} from "@/components/ui/dialog";

const items = [
  {
    cId: "C001",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678911",
    phone: "0912345678",
    username: "js1",
    password: "password",
  },
  {
    cId: "C002",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678912",
    phone: "0912345678",
    username: "js2",
    password: "password",
  },
  {
    cId: "C003",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678913",
    phone: "0912345678",
    username: "js3",
    password: "password",
  },
  {
    cId: "C004",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678914",
    phone: "0912345678",
    username: "js4",
    password: "password",
  },
];

const CustomerPage = () => {
  return (
    <div className='flex justify-center min-h-screen w-full p-6 bg-gray-100'>
      <div className='space-y-8 w-full max-w-7xl bg-white shadow-lg rounded-xl p-8 border border-gray-300'>
        {/* Header Section */}
        <div className='flex justify-between items-center mb-8'>
          <Search
            className='flex-grow border border-gray-300 rounded-lg px-4 py-3'
            placeholder='Search customers...'
          />
        </div>

        {/* Table Section */}
        <div className='overflow-x-auto rounded-lg bg-white shadow-md'>
          <Table className='min-w-full'>
            <TableHeader className='bg-green-500 pointer-events-none'>
              <TableRow>
                <TableHead className='text-center text-white font-semibold py-4'>
                  Customer ID
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  Avatar
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  Name
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  ID Number
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  Contact
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  Username
                </TableHead>
                <TableHead className='text-center text-white font-semibold py-4'>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} className='border-b hover:bg-gray-100'>
                  <TableCell className='text-center py-4'>{item.cId}</TableCell>
                  <TableCell className='text-center py-4'>
                    <Avatar className='mx-auto'>
                      <AvatarImage
                        src={item.avatar}
                        alt={`${item.name} avatar`}
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className='text-center font-medium py-4'>
                    {item.name}
                  </TableCell>
                  <TableCell className='text-center py-4'>
                    {item.idNumber}
                  </TableCell>
                  <TableCell className='text-center py-4'>
                    {item.phone}
                  </TableCell>
                  <TableCell className='text-center py-4'>
                    {item.username}
                  </TableCell>

                  {/* Action Section */}
                  <TableCell className='text-center py-4'>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <EllipsisVertical className='cursor-pointer text-gray-600 hover:text-gray-800' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className='w-40'>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className='text-center text-lg font-semibold'>
                                Confirm Deletion
                              </DialogTitle>
                              <DialogDescription className='text-center text-sm text-gray-600'>
                                Are you sure you want to delete this customer?
                                This action cannot be undone.
                              </DialogDescription>
                              <div className='flex justify-center gap-4 pt-6'>
                                <Button
                                  variant='outline'
                                  className='w-32 border-gray-300 text-gray-700'>
                                  Cancel
                                </Button>
                                <Button className='w-32 bg-red-600 text-white hover:bg-red-700'>
                                  Confirm
                                </Button>
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
