import { useEffect, useState, useCallback } from "react";
import Search from "@/components/ui/search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSearchParams } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import CheckInForm from "@/components/SmallForm/CheckInForm";
import { useMutation } from "@tanstack/react-query";
import * as ScheduleService from "@/services/scheduleService";
import { useSelector } from "react-redux";
import LineDetailsPopup from "./LineDetailsPopup";
import LineService from "@/services/LineService.js";

const TaskPage = () => {
  const [taskItems, setTaskItems] = useState([]);
  const [lines, setLines] = useState([]);
  const [filteredLines, setFilteredLines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLine, setSelectedLine] = useState(null);
  const [searchWord, setSearchWord] = useState("");

  const user = useSelector((state) => state.account);
  const userId = user._id;

  const fetchLines = useCallback(async () => {
    try {
      const response = await LineService.getLines();
      const rawLines = response.data;
      const transformedLines = rawLines.map((line) => ({
        ...line,
        start_place: {
          _id: line.start_place._id,
          name: line.start_place.name,
          pointX: line.start_place.pointX,
          pointY: line.start_place.pointY,
        },
        end_place: {
          _id: line.end_place._id,
          name: line.end_place.name,
          pointX: line.end_place.pointX,
          pointY: line.end_place.pointY,
        },
        arr_stop: line.arr_stop.map((stop) => ({
          _id: stop._id,
          name: stop.name,
          pointX: stop.pointX,
          pointY: stop.pointY,
        })),
      }));
      setLines(transformedLines);
      setFilteredLines(transformedLines);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching lines:", error);
    }
  }, []);

  const mutation = useMutation({
    mutationFn: (data) => {
      return ScheduleService.getEmployeeTask(data);
    },
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        setTaskItems(data);
      } else {
        console.error("Expected an array, but got:", data);
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const ITEMS_PER_PAGE = 10;
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;

  const totalPages = Math.ceil(filteredLines.length / ITEMS_PER_PAGE);
  const currentItems = taskItems
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

  const handleLineClick = (line) => {
    setSelectedLine(line);
  };

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState("");

  const handleCheckIn = (scheduleId) => {
    setCurrentScheduleId(scheduleId);
    setShowCheckIn(true);
  };

  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  useEffect(() => {
    mutation.mutate(userId);
  }, [user, showCheckIn]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );
  }

  return (
    <div className="flex flex-wrap gap-8 bg-gray-100 p-8 h-full w-full">
      <div className="flex flex-col flex-grow gap-4 bg-white py-4 px-8 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center gap-4">
          <Search
            className="flex-grow border border-gray-300 rounded-lg p-2"
            onChange={handleSearchChanged}
            text="Type line name..."
          />
        </div>
        <div className="overflow-x-auto rounded-lg bg-white shadow-md">
          <Table className="overflow-hidden rounded-t-lg border border-gray-300">
            <TableHeader className="bg-green-500 rounded-t-lg pointer-events-none">
              <TableRow>
                {[
                  "Name",
                  "Start Station",
                  "License Plate",
                  "Time Start",
                  "Status",
                ].map((header, idx) => (
                  <TableHead
                    key={idx}
                    className="text-center text-white text-base py-3 px-4">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item, index) => (
                <TableRow key={index} onClick={() => handleLineClick(item)}>
                  <TableCell className="text-center py-3 px-4">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {item.station}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {item.license_plate}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    {item.time}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    <span
                      className={`px-3 py-1 mx-2 w-full rounded-full text-xs font-medium ${
                        item.status === "Pending"
                          ? "bg-red-100 text-red-600"
                          : item.status === "Not start yet"
                          ? "bg-yellow-100 text-orange-600"
                          : item.status === "In Progress"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
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

      {/* Task Section */}
      <div className="rounded-lg h-full overflow-y-auto p-8 shadow-md border bg-white border-gray-200 w-80">
        <div className="text-2xl font-semibold mb-4 text-white bg-gradient-to-r from-green-500 to-green-500 shadow-lg rounded-lg py-3 px-5 text-center">
          Tasks
        </div>
        <div className="space-y-6">
          {taskItems.map((item, index) => (
            <div
              key={index}
              className="p-5 rounded-lg shadow-md border bg-white border-gray-200 transition">
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-lg font-medium text-gray-800 col-span-2">
                  {item.name}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Station:</span>{" "}
                  {item.station}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">
                    License plate:
                  </span>{" "}
                  {item.license_plate}
                </div>
                <div className="text-sm flex flex-col text-gray-600">
                  <span className="font-semibold text-gray-700">
                    Time start:
                  </span>
                  <div>{item.time}</div>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    item.status === "Completed"
                      ? "text-green-500"
                      : item.status === "Not started yet"
                      ? "text-yellow-500"
                      : "text-blue-500"
                  }`}>
                  <span className="text-gray-700">Status:</span>{" "}
                  {item.status || "Unknown"}
                </div>
              </div>
              <div className="mt-4 text-right">
                <button
                  onClick={() => handleCheckIn(item._id)}
                  className={`px-4 py-2 rounded-md ${
                    item.ticket3 || item.ticket7
                      ? "bg-slate-400 pointer-events-none text-slate-800"
                      : "bg-green-500 text-white"
                  } font-medium hover:bg-yellow-300 transition`}>
                  {item.ticket3 || item.ticket7 ? "Checked In" : "Check In"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popups */}
      {showCheckIn && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
            onClick={() => setShowCheckIn(false)}
          />
          <div className="fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-[9999] animate-fade-in">
            <CheckInForm
              childCloseFormRequest={() => setShowCheckIn(false)}
              role="busboy"
              scheduleId={currentScheduleId}
            />
          </div>
        </>
      )}

      {selectedLine && (
        <LineDetailsPopup
          line={selectedLine}
          onClose={() => setSelectedLine(null)}
        />
      )}
    </div>
  );
};

export default TaskPage;
