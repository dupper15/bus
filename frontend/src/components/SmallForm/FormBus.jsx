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

const formSchema = z.object({
  bus: z.string().nonempty({ message: "Bus ID is required." }),
  line: z.string().nonempty({ message: "Line ID is required." }),
  driver: z.string().nonempty({ message: "Driver ID is required." }),
  busboy: z.string().nonempty({ message: "Bus boy ID is required." }),
  time_start: z.string().nonempty({ message: "Time start is required." }),
  type: z.string().nonempty({ message: "Bus type is required." }),
  manufacture_year: z
    .string()
    .regex(/^\d{4}$/, { message: "Invalid year format." })
    .nonempty({ message: "Manufacture year is required." }),
  license_plate: z.string().nonempty({ message: "License plate is required." }),
  count_seat: z
    .number({ invalid_type_error: "Count seat must be a number." })
    .positive({ message: "Count seat must be positive." }),
  status: z.string().nonempty({ message: "Status is required." }),
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
      manufacture_year,
      license_plate,
      count_seat,
      status,
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
          className='w-full max-w-3xl bg-white shadow-xl border border-slate-300 rounded-lg p-8 h-max-[90%] my-10 h-max overflow-y-auto scrollbar-hide space-y-6'>
          <h1 className='text-3xl font-semibold text-green-600 text-center'>
            {isAdd === "true" ? "Add New Bus" : "Edit Bus"}
          </h1>

          {isAdd === "false" && (
            <div className='flex justify-center mb-6'>
              <Avatar className='w-28 h-28 border-4 border-green-500 shadow-lg'>
                <AvatarImage src={image || "default-avatar.jpg"} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='bus'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bus ID</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Bus ID' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='line'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Line ID</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Line ID' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='driver'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver ID</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Driver ID' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='busboy'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bus Boy ID</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Bus Boy ID' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='time_start'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Start</FormLabel>
                  <FormControl>
                    <Input type='time' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bus Type</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Bus Type' {...field} />
                  </FormControl>
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
                    <Input placeholder='Enter License Plate' {...field} />
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
                      type='number'
                      placeholder='Enter Seat Count'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Status' {...field} />
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

export default FormBus;
