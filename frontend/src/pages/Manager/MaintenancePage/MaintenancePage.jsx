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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams } from "react-router-dom";
import MaintenanceDetail from "@/components/SmallForm/MaintenanceDetail";

const items = [
  {
    mId: "M001",
    license: "59A 999.99",
    name: "John Smith",
    title: "Brake System Malfunctions",
    content: "Inspect the brake pads for wear and replace them if necessary.",
    sDate: "20-10-2024",
    eDate: "22-10-2024",
    price: "1.000.000",
  },
  {
    mId: "M002",
    license: "59A 999.99",
    name: "John Smith",
    title: "Electrical Problems",
    content:
      "Test individual electrical components, including lights, indicators, and HVAC systems.",
    sDate: "20-10-2024",
    eDate: "22-10-2024",
    price: "1.000.000",
  },
  {
    mId: "M003",
    license: "59A 999.99",
    name: "John Smith",
    title: "Cooling System Leaks",
    content:
      "Examine the cooling system, including hoses, connections, and the radiator, for any signs of leaks",
    sDate: "20-10-2024",
    eDate: "22-10-2024",
    price: "1.000.000",
  },
  {
    mId: "M004",
    license: "59A 999.99",
    name: "John Smith",
    title: "Fuel System Concerns",
    content:
      "Inspect the fuel system for leaks and repair or replace damaged components",
    sDate: "20-10-2024",
    eDate: "22-10-2024",
    price: "1.000.000",
  },
];

const MaintenancePage = () => {
  const ITEMS_PER_PAGE = 10;
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const [currentContent, setCurrentContent] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleClose = () => {
    setShowForm(false);
  };

  const currentItems = items
    .filter((item) => item.mId.toLowerCase().includes(searchWord.toLowerCase()))
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

  return (
    <div className="flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4">
      <div className="flex w-full space-x-6">
        <div className="flex-1 basis-2/3 space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300">
          <div className="flex items-center gap-4">
            <Search
              className="flex-grow border border-gray-300 rounded-lg p-2"
              onChange={handleSearchChanged}
              text="Type maintenance id..."
            />
          </div>

          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <Table className="overflow-hidden rounded-t-lg border border-gray-300">
              <TableHeader className="bg-green-500 pointer-events-none">
                <TableRow>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    Maintenance ID
                  </TableHead>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    License
                  </TableHead>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    Employee Name
                  </TableHead>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    Title
                  </TableHead>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    Start Date
                  </TableHead>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    End Date
                  </TableHead>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    Price
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item, index) => (
                  <TableRow
                    key={index}
                    className="cursor-pointer"
                    onClick={() => {
                      setShowForm(true);
                      setCurrentContent(item.content);
                      setCurrentTitle(item.title);
                    }}>
                    <TableCell className="text-center py-3 px-4">
                      {item.mId}
                    </TableCell>
                    <TableCell className="font-medium text-center py-3 px-4">
                      {item.license}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.title}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.sDate}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.eDate}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.price}
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
        </div>

        {showForm && (
          <div className="fixed inset-0 w-full h-full z-10 -left-10 flex justify-center items-center transition-transform">
            <MaintenanceDetail
              handleClose={handleClose}
              content={currentContent}
              title={currentTitle}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;
