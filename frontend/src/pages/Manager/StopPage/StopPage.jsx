import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import React, { useCallback, useEffect, useState } from "react";
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
} from "@/components/ui/dialog";

import { useSearchParams } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { StopMapView } from "@/pages/Manager/StopPage/StopMap/StopMap";
import StopService from "@/services/StopService";
import { transformStop } from "@/utils/Transformer";
import FormStop from "@/components/SmallForm/FormStop.jsx";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {error, success} from "@/components/ui/alert.jsx";
const StopPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [selectedStopCoordinates, setSelectedStopCoordinates] = useState(null);
  const getId = (index, currentPage) => {
    const calculatedIndex = (currentPage - 1) * 10 + index;
    if (calculatedIndex < 10) return "S00" + calculatedIndex;
    else if (calculatedIndex < 100) return "S0" + calculatedIndex;
    else return "S" + calculatedIndex;
  };
  const fetchStops = useCallback(async () => {
    try {
      const response = await StopService.getStops();
      const rawStops = response.data;
      setStops(rawStops.map(transformStop));
    } catch (err) {
      error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStops();
  }, [fetchStops]);

  const ITEMS_PER_PAGE = 10;
  const [searchWord, setSearchWord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;

  const filteredStops = stops.filter((stop) =>
    stop.name.toLowerCase().includes(searchWord.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStops.length / ITEMS_PER_PAGE);
  const currentItems = filteredStops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page });
    }
  };

  const handleSearchChanged = (e) => {
    setSearchWord(e.target.value);
    setSearchParams({ page: 1 });
  };

  const handleAddClick = () => {
    setDialogType("add");
    setSelectedStop(null);
    setShowForm(true);
    setShowDialog(false);
  };

  const handleEditClick = (stop) => {
    setDialogType("edit");
    setSelectedStop(stop);
    setShowForm(true);
    setShowDialog(false);
    setSelectedStopCoordinates([
      parseFloat(stop.pointX),
      parseFloat(stop.pointY),
    ]);
  };

  const handleDeleteClick = (stop) => {
    setSelectedStop(stop);
    setDialogType("delete");
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setShowDialog(false);
    setShowMap(false);
    setSelectedStop(null);
    setSelectedStopCoordinates(null);
  };

  const handleMapClick = (locationData) => {
    if (showForm) {
      setSelectedStop((prev) => ({
        ...prev,
        ...locationData,
      }));
    }
  };

  const handleDelete = async () => {
    try {
      if(!selectedStop?.id){
        error("Invalid stop selected for deletion");
        return;
      }
      const response = await StopService.deleteStop(selectedStop.id);
      if (response.status === "OK") {
        success("Stop deleted successfully");
        await fetchStops();
        setShowDialog(false);
      } else {
        error(response.message || "Failed to delete stop");
      }
    } catch (err) {
      error("An error occurred while deleting the stop");
      console.error("Error deleting stop:", err);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (dialogType === "add") {
        const response = await StopService.createStop(formData);
        if (response.status === "OK") {
          success("Stop created successfully");
        } else {
          error(response.message || "Failed to create stop");
        }
      } else {
        const response = await StopService.updateStop(formData.id, formData);
        if (response.status === "OK") {
          success("Stop updated successfully");
        } else {
          error(response.message || "Failed to update stop");
        }
      }
      await fetchStops();
      handleClose();
    } catch (err) {
      error("An error occurred while processing your request");
      console.error("Error submitting line:", err);
    }
  };
  return (
    <div className='flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4'>
      <div className='flex w-full space-x-6'>
        <div className='flex-1 w-full space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
          <div className='flex items-center gap-4'>
            <Search
              className='flex-grow border border-gray-300 rounded-lg p-2'
              onChange={handleSearchChanged}
              text='Search by name...'
            />
            <Button onClick={handleAddClick} className='flex-shrink-0'>
              +
            </Button>
          </div>
          <div className='overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-md'>
            <Table className='overflow-hidden rounded-t-lg '>
              <TableHeader className='bg-green-500 rounded-t-lg pointer-events-none'>
                <TableRow>
                  {[
                    "Stop Id",
                    "Name",
                    "Address",
                    "Point X",
                    "Point Y",
                    "Is Station",
                    "Action",
                  ].map((header, idx) => (
                    <TableHead
                      key={idx}
                      className='text-center  text-white text-base py-3 px-4'>
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array(5)
                      .fill()
                      .map((_, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Skeleton height={20} width='50%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='80%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='80%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='80%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='50%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='60%' />
                          </TableCell>
                          <TableCell>
                            <Skeleton height={20} width='30%' />
                          </TableCell>
                        </TableRow>
                      ))
                  : currentItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className='text-center py-3 px-4'>
                          {getId(index + 1, currentPage)}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {item.name}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {item.address}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {item.pointX}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {item.pointY}
                        </TableCell>
                        <TableCell className='text-center py-3 px-4'>
                          {item.isStation === "true" ? "Yes" : "No"}
                        </TableCell>
                        <TableCell className='text-center flex justify-center items-center py-3 px-4'>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <EllipsisVertical className='mb-2' />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => handleEditClick(item)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(item)}>
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
        </div>
      </div>

      {showForm && (
        <FormStop
          isAdd={dialogType === "add"}
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          initialData={selectedStop}
          showMap={showMap}
          setShowMap={setShowMap}
          onMapClick={handleMapClick}
          selectedStopCoordinates={selectedStopCoordinates}
        />
      )}

      {showDialog && dialogType === "delete" && (
        <Dialog open={showDialog} onOpenChange={handleClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='text-center'>
                Are you sure you want to delete?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                stop.
              </DialogDescription>
              <div className='flex items-center justify-center gap-2 pt-4'>
                <Button
                  variant='outline'
                  className='w-[120px]'
                  onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant='destructive' className='w-[120px]' onClick={handleDelete}>
                  Confirm
                </Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StopPage;
