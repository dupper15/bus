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

const items = [
  {
    tId: "T001",
    name: "John Smith",
    effectiveDate: "20-10-2024",
    expirationDate: "20-11-2024",
    status: "Expired",
  },
  {
    tId: "T002",
    name: "John Smith",
    effectiveDate: "20-12-2024",
    expirationDate: "20-1-2025",
    status: "Valid",
  },
  {
    tId: "T003",
    name: "John Smith",
    effectiveDate: "20-10-2024",
    expirationDate: "20-11-2024",
    status: "Expired",
  },
  {
    tId: "T004",
    name: "John Smith",
    effectiveDate: "20-10-2024",
    expirationDate: "20-11-2024",
    status: "Expired",
  },
];

const TicketPage = () => {
  const ITEMS_PER_PAGE = 10;
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  const currentItems = items
    .filter((item) => item.tId.toLowerCase().includes(searchWord.toLowerCase()))
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
              text="Type ticket id..."
            />
          </div>

          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <Table className="overflow-hidden rounded-t-lg border border-gray-300">
              <TableHeader className="bg-green-500 pointer-events-none">
                <TableRow>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    Ticket ID
                  </TableHead>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    Customer Name
                  </TableHead>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    Effective Date
                  </TableHead>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    Expiration Date
                  </TableHead>
                  <TableHead className="text-center text-white text-base py-3 px-4">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center py-3 px-4">
                      {item.tId}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.effectiveDate}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      {item.expirationDate}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      <span
                        className={`px-3 py-1 mx-2 w-full rounded-full text-xs font-medium ${
                          item.status === "Valid"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}>
                        {item.status}
                      </span>
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
      </div>
    </div>
  );
};

export default TicketPage;
