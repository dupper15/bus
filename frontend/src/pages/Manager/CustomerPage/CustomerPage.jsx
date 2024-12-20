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
    <div className="flex justify-center min-h-screen w-full p-4">
      <div className="space-y-6 w-full max-w-6xl">
        <div className="flex items-center gap-4">
          <Search className="flex-grow" />
          <Button className="flex-shrink-0">+</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="overflow-hidden rounded-lg border border-gray-300 ">
            <TableHeader className="bg-[#4CAF50]">
              <TableRow>
                <TableHead className="text-center text-white">
                  Customer ID
                </TableHead>
                <TableHead className="text-center text-white">Avatar</TableHead>
                <TableHead className="text-center text-white">Name</TableHead>
                <TableHead className="text-center text-white">
                  ID Number
                </TableHead>
                <TableHead className="text-center text-white">
                  Contact
                </TableHead>
                <TableHead className="text-center text-white">
                  Username
                </TableHead>
                <TableHead className="text-center text-white">
                  Password
                </TableHead>
                <TableHead className="text-center text-white">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{item.cId}</TableCell>
                  <TableCell className="text-center flex justify-center items-center">
                    <Avatar>
                      <AvatarImage src={avatar} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-center">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-center">{item.idNumber}</TableCell>
                  <TableCell className="text-center">{item.phone}</TableCell>
                  <TableCell className="text-center">{item.username}</TableCell>
                  <TableCell className="text-center">{item.password}</TableCell>
                  <TableCell className="text-center flex justify-center items-center">
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <EllipsisVertical className="mb-2 " />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          {/* Show dialog delete */}
                          <DialogTrigger asChild>
                            <DropdownMenuItem>
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-center">
                            Are you sure you want to delete?
                          </DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                          </DialogDescription>
                          <div className="flex items-center justify-center gap-2 pt-4">
                            <Button variant="outline" className="w-[120px]">
                              Cancel
                            </Button>
                            <Button className="w-[120px]">Confirm</Button>
                          </div>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
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
