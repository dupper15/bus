import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "react-query";
import * as BusService from "../../services/busService";
import * as Message from "../../components/ui/alert";
import { useState } from "react";

const formSchema = z.object({
  type: z
    .string()
    .refine((value) => value === "Electricity" || value === "Power", {
      message: "Type must be either 'Electricity' or 'Power'.",
    }),
  manufacture_year: z
    .string()
    .length(4, { message: "Manufacture year must be exactly 4 digits." })
    .refine((value) => /^\d{4}$/.test(value), {
      message: "Manufacture year must be a valid year.",
    }),
  license_plate: z
    .string()
    .min(5, { message: "License plate must be at least 5 characters." })
    .max(12, { message: "License plate must not exceed 12 characters." }),
  count_seat: z
    .string()
    .refine((value) => /^\d+$/.test(value), {
      message: "Seat count must be a valid number.",
    })
    .refine((value) => parseInt(value) >= 20 && parseInt(value) <= 60, {
      message: "Seat count must be between 20 and 60.",
    }),
});

const FormBus = ({
  isAdd,
  handleClose,
  type = "",
  manufacture_year = "",
  image = "",
  license_plate = "",
  count_seat = "",
  status = "",
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type,
      image,
      manufacture_year,
      license_plate,
      count_seat,
      status,
    },
  });

  const mutationCreate = useMutation({
    mutationFn: async ({ data }) => {
      return await BusService.createBus(data);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      Message.error(errorMessage); // Hiển thị lỗi
    },
    onSuccess: (data) => {
      if (data.status === "ERROR") {
        Message.error(data.message); // Hiển thị lỗi từ API
      } else if (data.status === "OK") {
        Message.success(data.message); // Hiển thị thông báo thành công
        handleClose();
      }
    },
  });

  const mutationEdit = useMutation({
    mutationFn: async ({ data }) => {
      return await BusService.editBus(data);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      Message.error(errorMessage); // Hiển thị lỗi
    },
    onSuccess: (data) => {
      if (data.status === "ERROR") {
        Message.error(data.message); // Hiển thị lỗi từ API
      } else if (data.status === "OK") {
        Message.success(data.message); // Hiển thị thông báo thành công
        handleClose();
      }
    },
  });

  const [uploadImage, setUploadImage] = useState(image);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const uploadPreset = "afh5sfc";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/ddcjjegzf/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    setUploadImage(result.secure_url);

    form.setValue("image", result.secure_url);
  };

  const onSubmit = async () => {
    const isValid = await form.trigger();

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
  };

  return (
    <div
      className='absolute inset-0 -top-10 p-2
    py-12 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full max-w-3xl bg-white shadow-xl border border-slate-300 rounded-lg p-8 h-max-[90%] my-10 h-max overflow-y-auto scrollbar-hide space-y-6'>
          <h1 className='text-3xl font-semibold text-green-600 text-center'>
            {isAdd === "true" ? "Add New Bus" : "Edit Bus"}
          </h1>

          <div className='flex justify-center mb-6 relative'>
            <Avatar className='w-28 h-28 border-4 border-green-500 shadow-lg'>
              <AvatarImage src={uploadImage || "default-avatar.jpg"} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className='absolute bottom-0 translate-y-1/2'>
              <label
                htmlFor='upload-avatar'
                className='w-6 h-6 bg-green-500 text-white flex items-center justify-center rounded-full cursor-pointer'>
                +
              </label>
              <input
                id='upload-avatar'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                      <SelectItem value='Electricity'>Electricity</SelectItem>
                      <SelectItem value='Power'>Power</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='manufacture_year'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacture Year</FormLabel>
                  <FormControl>
                    <Input type='text' placeholder='YYYY' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='license_plate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      placeholder='Enter license plate'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='count_seat'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seat Count</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      placeholder='Enter seat count'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAdd === "false" && (
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Active'>Active</SelectItem>
                        <SelectItem value='Unactive'>Unactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className='flex justify-end gap-4 mt-6'>
            <button
              onClick={handleClose}
              type='button'
              className='bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300'>
              Cancel
            </button>
            <button
              type='submit'
              className='bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700'>
              Submit
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormBus;
