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

const items = [
  {
    mId: "M001",
    license: "59A 999.99",
    eId: "E001",
    name: "John Smith",
    sDate: "20-10-2024",
    eDate: "22-10-2024",
    price: "1.000.000",
  },
  {
    mId: "M002",
    license: "59A 999.99",
    eId: "E001",
    name: "John Smith",
    sDate: "20-10-2024",
    eDate: "22-10-2024",
    price: "1.000.000",
  },
  {
    mId: "M003",
    license: "59A 999.99",
    eId: "E001",
    name: "John Smith",
    sDate: "20-10-2024",
    eDate: "22-10-2024",
    price: "1.000.000",
  },
  {
    mId: "M004",
    license: "59A 999.99",
    eId: "E001",
    name: "John Smith",
    sDate: "20-10-2024",
    eDate: "22-10-2024",
    price: "1.000.000",
  },
];

const MaintenancePage = () => {
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
                  Maintenance ID
                </TableHead>
                <TableHead className="text-center text-white">
                  License
                </TableHead>
                <TableHead className="text-center text-white">
                  Employee ID
                </TableHead>
                <TableHead className="text-center text-white">
                  Employee Name
                </TableHead>
                <TableHead className="text-center text-white">
                  Start Date
                </TableHead>
                <TableHead className="text-center text-white">
                  End Date
                </TableHead>
                <TableHead className="text-center text-white">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{item.mId}</TableCell>
                  <TableCell className="font-medium text-center">
                    {item.license}
                  </TableCell>
                  <TableCell className="text-center">{item.eId}</TableCell>
                  <TableCell className="text-center">{item.name}</TableCell>
                  <TableCell className="text-center">{item.sDate}</TableCell>
                  <TableCell className="text-center">{item.eDate}</TableCell>
                  <TableCell className="text-center">{item.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
