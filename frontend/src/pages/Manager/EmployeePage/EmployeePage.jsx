import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import React, { useState } from "react";
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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useNavigate, useSearchParams } from "react-router-dom";
//import AddEmployeePage from "./AddEmployeePage";
  

const items = [
  {
    eId: "E001",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678911",
    role: "Bus boy",
    phone: "0912345678",
    request: 1,
    date: "20-10-2024",
  },
  {
    eId: "E002",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678912",
    role: "Bus boy",
    phone: "0912345678",
    request: 2,
    date: "20-10-2024",
  },
  {
    eId: "E003",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678913",
    role: "Bus boy",
    phone: "0912345678",
    request: 3,
    date: "20-10-2024",
  },
  {
    eId: "E004",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678914",
    role: "Bus boy",
    phone: "0912345678",
    request: 4,
    date: "20-10-2024",
  },
  {
    eId: "E005",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678911",
    role: "Bus boy",
    phone: "0912345678",
    request: 1,
    date: "20-10-2024",
  },
  {
    eId: "E006",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678912",
    role: "Bus boy",
    phone: "0912345678",
    request: 2,
    date: "20-10-2024",
  },
  {
    eId: "E007",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678913",
    role: "Bus boy",
    phone: "0912345678",
    request: 3,
    date: "20-10-2024",
  },
  {
    eId: "E008",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678914",
    role: "Bus boy",
    phone: "0912345678",
    request: 4,
    date: "20-10-2024",
  },
  {
    eId: "E009",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678911",
    role: "Bus boy",
    phone: "0912345678",
    request: 1,
    date: "20-10-2024",
  },
  {
    eId: "E010",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678912",
    role: "Bus boy",
    phone: "0912345678",
    request: 2,
    date: "20-10-2024",
  },
  {
    eId: "E011",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678913",
    role: "Bus boy",
    phone: "0912345678",
    request: 3,
    date: "20-10-2024",
  },
  {
    eId: "E012",
    name: "John Smith",
    avatar: avatar,
    idNumber: "012345678914",
    role: "Bus boy",
    phone: "0912345678",
    request: 4,
    date: "20-10-2024",
  },
];

const ITEMS_PER_PAGE = 10;



const EmployeePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1; // Lấy trang từ query string hoặc mặc định là 1
  const navigate = useNavigate()
  // Tính tổng số trang
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  // Lấy danh sách mục cho trang hiện tại
  const currentItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  // Xử lý chuyển trang và cập nhật query string
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page }); // Cập nhật query string
    }
  };
  
  const [add, setAdd] = useState(false);

  const handleAdd = () => {
    setAdd(!add);
    navigate("add-employee");
  };

  const onNavigateDetail = (id) => {
    console.log("id", id)
    navigate(`/manage/employee/${id}/detail-employee`);
  };
  

  return (
    <div className="flex justify-center min-h-screen w-full p-4">
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-4">
          <Search className="flex-grow" />
          <Button onClick={handleAdd} className="flex-shrink-0">+</Button>
        </div>
        {/* Add Employee */}

        {/* {(add) && (
           
              <AddEmployeePage className='flex justify-center absolute'/>
       
        )} */}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="overflow-hidden rounded-lg border border-gray-300 ">
            <TableHeader className="bg-[#4CAF50]">
              <TableRow>
                <TableHead className="text-center text-white">
                  Employee ID
                </TableHead>
                <TableHead className="text-center text-white">Avatar</TableHead>
                <TableHead className="text-center text-white">Name</TableHead>
                <TableHead className="text-center text-white">
                  ID Number
                </TableHead>
                <TableHead className="text-center text-white">Role</TableHead>
                <TableHead className="text-center text-white">
                  Contact
                </TableHead>
                <TableHead className="text-center text-white">
                  Request
                </TableHead>
                <TableHead className="text-center text-white">
                  Hire date
                </TableHead>
                <TableHead className="text-center text-white">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {currentItems.map((item, index) => (
                <TableRow key={index} className="cursor-pointer" onClick= {() => onNavigateDetail(item.eId)}>
                  <TableCell className="text-center">{item.eId}</TableCell>
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
                  <TableCell className="text-center">{item.role}</TableCell>
                  <TableCell className="text-center">{item.phone}</TableCell>
                  <TableCell className="font-medium text-center">
                    <Button>{item.request}</Button>
                  </TableCell>
                  <TableCell className="text-center">{item.date}</TableCell>
                  <TableCell className="text-center flex justify-center items-center">
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <EllipsisVertical className="mb-2 " />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
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
        {/* Pagination */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(currentPage - 1)}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={() => handlePageChange(index + 1)}
                  className={index + 1 === currentPage ? "font-bold" : ""}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default EmployeePage;
