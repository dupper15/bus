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
    tId: "T001",
    cId: "C001",
    name: "John Smith",
    effectiveDate: "20-10-2024",
    expirationDate: "20-11-2024",
  },
  {
    tId: "T002",
    cId: "C001",
    name: "John Smith",
    effectiveDate: "20-10-2024",
    expirationDate: "20-11-2024",
  },
  {
    tId: "T003",
    cId: "C001",
    name: "John Smith",
    effectiveDate: "20-10-2024",
    expirationDate: "20-11-2024",
  },
  {
    tId: "T004",
    cId: "C001",
    name: "John Smith",
    effectiveDate: "20-10-2024",
    expirationDate: "20-11-2024",
  },
];

const TicketPage = () => {
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
                  Ticket ID
                </TableHead>
                <TableHead className="text-center text-white">
                  Customer ID
                </TableHead>
                <TableHead className="text-center text-white">
                  Customer Name
                </TableHead>
                <TableHead className="text-center text-white">
                  Effective Date
                </TableHead>
                <TableHead className="text-center text-white">
                  Expiration Date
                </TableHead>
                <TableHead className="text-center text-white">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{item.tId}</TableCell>
                  <TableCell className="text-center">{item.cId}</TableCell>
                  <TableCell className="text-center">{item.name}</TableCell>
                  <TableCell className="text-center">
                    {item.effectiveDate}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.expirationDate}
                  </TableCell>
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

export default TicketPage;
