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
  name: z.string().nonempty({ message: "Name is required." }),
  phone: z
    .string()
    .regex(/^\d{10,12}$/, { message: "Invalid phone number." })
    .nonempty({ message: "Phone number is required." }),
  id_card: z.string().nonempty({ message: "ID Card is required." }),
  status: z.enum(["able", "disable"], { message: "Invalid status." }),
});

const FormLine = ({
  isAdd,
  handleClose,
  id = "",
  name = "",
  start_place = "",
  end_place = "",
  time = "",
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      start_place,
      end_place,
      time,
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
            {isAdd === "true" ? "Add New Line" : "Edit Line"}
          </h1>

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
                    <Input placeholder='Enter Line Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='start_place'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start place</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Start Place...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='end_place'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Place</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter End Place...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Time...' {...field} />
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

export default FormLine;
