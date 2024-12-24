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

const formSchema = z.object({
  id: z.string().optional(), // id không bắt buộc
  name: z.string().nonempty({ message: "Name is required." }),
  address: z.string().nonempty({ message: "Address is required." }),
  pointX: z
    .string()
    .regex(/^-?\d+(\.\d+)?$/, { message: "Point X must be a valid number." }),
  pointY: z
    .string()
    .regex(/^-?\d+(\.\d+)?$/, { message: "Point Y must be a valid number." }),
  isStation: z.enum(["true", "false"]).transform((val) => val === "true"), // Chuyển đổi thành boolean
});

const FormStop = ({
  isAdd,
  handleClose,
  id = "",
  name = "",
  address = "",
  pointX = "",
  pointY = "",
  isStation = "false",
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id,
      name,
      address,
      pointX,
      pointY,
      isStation,
    },
  });

  const onCreate = (e) => {
    e.preventDefault();
    const values = form.getValues();
    console.log("Form submitted successfully");
    console.log(values);
  };

  return (
    <div className='absolute inset-0 -top-10 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center'>
      <Form {...form}>
        <form
          onSubmit={(e) => onCreate(e)}
          className='w-full max-w-3xl bg-white shadow-xl border border-slate-300 rounded-lg p-8 h-max overflow-y-auto scrollbar-hide space-y-6'>
          <h1 className='text-3xl font-semibold text-green-600 text-center'>
            {isAdd === "true" ? "Add New Stop" : "Edit Stop"}
          </h1>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* ID Field */}
            <FormField
              control={form.control}
              name='id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop ID</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Stop ID' {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name Field */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Stop Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Field */}
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Address' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Point X Field */}
            <FormField
              control={form.control}
              name='pointX'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Point X</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      placeholder='Enter Point X (e.g., 12.3456)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Point Y Field */}
            <FormField
              control={form.control}
              name='pointY'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Point Y</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      placeholder='Enter Point Y (e.g., 98.7654)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Station Field */}
            <FormField
              control={form.control}
              name='isStation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is Station</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className='block w-full border border-gray-300 rounded-lg px-3 py-2'>
                      <option value='true'>Yes</option>
                      <option value='false'>No</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

export default FormStop;
