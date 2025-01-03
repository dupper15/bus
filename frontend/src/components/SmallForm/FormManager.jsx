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
import { useMutation } from "@tanstack/react-query";
import * as ManagerService from "../../services/managerService";
import * as Message from "../../components/ui/alert";

const formSchema = z.object({
  name: z.string().nonempty({ message: "Name is required." }),
  phone: z
    .string()
    .regex(/^\d{10,12}$/, { message: "Invalid phone number." })
    .nonempty({ message: "Phone number is required." }),
  id_card: z.string().nonempty({ message: "ID Card is required." }),
  status: z.enum(["able", "disable"], { message: "Invalid status." }),
  gender: z.enum(["male", "female", "other"], { message: "Invalid gender." }),
});

const FormManager = ({
  getAll,
  handleClose,
  id = "",
  name = "",
  phone = "",
  image = "",
  id_card = "",
  status = "",
  gender = "",
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      phone,
      id_card,
      status: status || "able",
      gender: gender || "male",
    },
  });

  const mutationAdd = useMutation({
    mutationFn: async ({ data }) => {
      return await ManagerService.addManager(data);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      Message.error(errorMessage);
    },
    onSuccess: (data) => {
      if (data.status === "ERROR") {
        Message.error(data.message);
      } else if (data.status === "OK") {
        Message.success(data.message);
        getAll(), handleClose();
      }
    },
  });

  const onCreate = async () => {
    const values = form.getValues();
    values.username = values.id_card;
    values.password = values.id_card;
    mutationAdd.mutate({ data: values });
  };

  return (
    <div className='absolute inset-0 p-2 py-10 bg-black bg-opacity-80 -top-10 backdrop-blur-sm flex justify-center items-center'>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            onCreate();
            e.preventDefault();
          }}
          className='w-full max-w-2xl h-max  overflow-y-auto bg-white shadow-lg border rounded-lg p-6 space-y-6'>
          <h1 className='text-2xl font-bold text-green-500 text-center'>
            Add New Manager
          </h1>
          <div className='grid grid-cols-1 gap-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Manager Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Phone Number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='id_card'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Card</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter ID Card Number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='gender'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <select className='border rounded-lg p-2 w-full' {...field}>
                      <option value='male'>Male</option>
                      <option value='female'>Female</option>
                      <option value='other'>Other</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex justify-end gap-4 mt-4'>
            <button
              onClick={handleClose}
              type='button'
              className='bg-slate-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200'>
              Cancel
            </button>
            <button
              type='submit'
              className='bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-400'>
              Submit
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormManager;
