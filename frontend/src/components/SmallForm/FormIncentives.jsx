import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useMutation } from "react-query";
import * as IncentiveService from "@/services/incentivesService";
import * as EmployeeService from "@/services/employeeService";
import * as Message from "@/components/ui/alert";
import { ClipLoader } from "react-spinners";
import { useEffect, useState } from "react";

const formSchema = z.object({
  id: z.string().nonempty({ message: "ID is required." }),
  content: z
    .string()
    .nonempty({ message: "Content is required." })
    .regex(/^[a-zA-Z0-9 ]*$/, {
      message: "Content must contain only alphanumeric characters.",
    }),
  price: z.string().refine((value) => /^\d+$/.test(value), {
    message: "Price must be a valid number.",
  }),
  type: z.enum(["Reward", "Punishment"], {
    message: "Invalid type. Please select either 'Reward' or 'Punishment'.",
  }),
  date: z.preprocess(
    (value) => (typeof value === "string" ? new Date(value) : value), // Chuyển chuỗi thành `Date`
    z.date().refine((date) => date <= new Date(), {
      message: "Date must be a valid date and cannot be in the future.",
    })
  ),
});

const FormIncentives = ({ isAdd, handleClose, incentives }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues:
      isAdd === "true"
        ? {
            id: "",
            type: "",
            content: "",
            date: "",
            price: "",
          }
        : {
            id: incentives.employee._id,
            type: incentives.type,
            content: incentives.content,
            date: incentives.date,
            price: incentives.price,
          },
  });

  const onSubmit = async () => {
    const isValid = await form.trigger();
    setIsSubmitting(true);
    if (!isValid) {
      console.log("Validation errors:", form.formState.errors); // Log lỗi nếu có
      return; // Dừng lại nếu form có lỗi
    }
    const values = form.getValues();
    if (isAdd === "true") {
      mutationCreate.mutate({ data: values });
    } else {
      mutationEdit.mutate({ data: values });
    }
    setIsSubmitting(false);
  };

  const mutationCreate = useMutation({
    mutationFn: async ({ data }) => {
      return await IncentiveService.createIncentives(data);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      Message.error(errorMessage); // Hiển thị lỗi
      setIsSubmitting(false);
    },
    onSuccess: (data) => {
      if (data.status === "ERROR") {
        Message.error(data.message); // Hiển thị lỗi từ API
      } else if (data.status === "OK") {
        Message.success(data.message); // Hiển thị thông báo thành công
        setIsSubmitting(false);
        handleClose();
      }
    },
  });

  const mutationEdit = useMutation({
    mutationFn: async ({ data }) => {
      return await IncentiveService.editIncentives(data);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      setIsSubmitting(false);

      Message.error(errorMessage); // Hiển thị lỗi
    },
    onSuccess: (data) => {
      if (data.status === "ERROR") {
        Message.error(data.message); // Hiển thị lỗi từ API
      } else if (data.status === "OK") {
        Message.success(data.message); // Hiển thị thông báo thành công
        setIsSubmitting(false);
        handleClose();
      }
    },
  });

  const mutationEmployee = useMutation({
    mutationFn: async () => {
      return await EmployeeService.getAllEmployee();
    },
    onError: (error) => {
      console.error("Error creating incentives:", error);
    },
    onSuccess: (data) => {
      setItems(data.data);
    },
  });

  useEffect(() => {
    mutationEmployee.mutate();
  }, [handleClose]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  return (
    <div className='absolute inset-0 p-4 bg-black bg-opacity-80 -top-10 backdrop-blur-sm flex justify-center items-center'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full max-w-2xl bg-white shadow-lg h-max border my-4 mb-10 scrollbar-hide overflow-y-auto rounded-lg p-6 space-y-6'>
          <h1 className='text-2xl font-bold text-green-500 text-center'>
            {isAdd === "true" ? "Add New Incentive" : "Edit Incentive"}
          </h1>

          {/* Form Fields */}
          <div className='grid grid-cols-1 gap-6'>
            <FormField
              control={form.control}
              name='id'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel>ID Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a employee' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.id} - {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Reward'>Reward</SelectItem>
                      <SelectItem value='Punishment'>Punishment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter content' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full text-left font-normal'>
                        {field.value
                          ? format(new Date(field.value), "PPP")
                          : "Pick a date"}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => {
                          field.onChange(date || new Date()); // Luôn cập nhật kiểu `Date`
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Price...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Buttons */}
          <div className='flex justify-end gap-4 mt-4'>
            <button
              onClick={handleClose}
              type='button'
              className='bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400'>
              {isSubmitting ? (
                <ClipLoader size={24} color='#fff' />
              ) : (
                <span>Cancel</span>
              )}
            </button>
            <button
              type='submit'
              className='bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-400'>
              {isSubmitting ? (
                <ClipLoader size={24} color='#fff' />
              ) : (
                <span>Submit</span>
              )}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormIncentives;
