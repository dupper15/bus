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
import { FaRegCalendarMinus } from "react-icons/fa";

const items = [
  {
    oId: "O001",
    title: "Impolite attitude",
    cId: "C001",
    name: "John Smith",
    date: "20-10-2024",
    status: "Resolved",
  },
  {
    oId: "O002",
    title: "Impolite attitude",
    cId: "C001",
    name: "John Smith",
    date: "20-10-2024",
    status: "Pending",
  },
  {
    oId: "O003",
    title: "Impolite attitude",
    cId: "C001",
    name: "John Smith",
    date: "20-10-2024",
    status: "Pending",
  },
  {
    oId: "O004",
    title: "Impolite attitude",
    cId: "C001",
    name: "John Smith",
    date: "20-10-2024",
    status: "Pending",
  },
];

const OpinionPage = () => {
  return (
    <div className="flex justify-center min-h-screen w-full p-4">
      <div className="space-y-6 w-full max-w-6xl">
        <div className="flex items-center gap-4">
          <Search className="flex-grow" />
          <Button className="flex-shrink-0">
            <FaRegCalendarMinus />
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="overflow-hidden rounded-lg border border-gray-300 ">
            <TableHeader className="bg-[#4CAF50]">
              <TableRow>
                <TableHead className="text-center text-white">
                  Opinion ID
                </TableHead>
                <TableHead className="text-center text-white">Title</TableHead>
                <TableHead className="text-center text-white">
                  Customer ID
                </TableHead>
                <TableHead className="text-center text-white">
                  Customer Name
                </TableHead>
                <TableHead className="text-center text-white">
                  Receive date
                </TableHead>
                <TableHead className="text-center text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{item.oId}</TableCell>
                  <TableCell className="font-medium text-center">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-center">{item.cId}</TableCell>
                  <TableCell className="text-center">{item.name}</TableCell>
                  <TableCell className="text-center">{item.date}</TableCell>
                  <TableCell className="text-center">{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default OpinionPage;
