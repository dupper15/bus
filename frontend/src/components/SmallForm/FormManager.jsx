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
import { is } from "date-fns/locale";

const formSchema = z.object({
  name: z.string().nonempty({ message: "Name is required." }),
  phone: z
    .string()
    .regex(/^\d{10,12}$/, { message: "Invalid phone number." })
    .nonempty({ message: "Phone number is required." }),
  id_card: z.string().nonempty({ message: "ID Card is required." }),
  status: z.enum(["able", "disable"], { message: "Invalid status." }),
});

const FormManager = ({
  isAdd,
  handleClose,
  id = "",
  name = "",
  phone = "",
  image = "",
  id_card = "",
  status = "",
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      phone,
      id_card,
      status: status || "able",
    },
  });

  const onCreate = (e) => {
    e.preventDefault();
    const values = form.getValues();
    console.log("Form submitted successfully:", values);
  };

  return (
    <div className='absolute inset-0 bg-black bg-opacity-80 -top-10 backdrop-blur-sm flex justify-center items-center'>
      <Form {...form}>
        <form
          onSubmit={onCreate}
          className='w-full max-w-2xl bg-white shadow-lg border rounded-lg p-6 space-y-6'>
          <h1 className='text-2xl font-bold text-green-500 text-center'>
            {isAdd === "true" ? "Add New Manager" : "Edit Manager"}
          </h1>

          {/* Avatar */}
          {isAdd === "false" && (
            <div className='flex justify-center mb-4'>
              <Avatar className='w-24 h-24 border-4 border-green-500 shadow-lg'>
                <AvatarImage src={image || "default-avatar.jpg"} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Form Fields */}
          <div className='grid grid-cols-1 gap-6'>
            {isAdd === "false" && (
              <div className='flex flex-col space-y-2'>
                <FormLabel>ID:</FormLabel>
                <div className='text-gray-700 bg-gray-100 p-2 rounded border'>
                  {id}
                </div>
              </div>
            )}

            {/* Name */}
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

            {/* Phone */}
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

            {/* ID Card */}
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

            {/* Status */}
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select className='border rounded-lg p-2 w-full' {...field}>
                      <option value='able'>Able</option>
                      <option value='disable'>Disable</option>
                    </select>
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
