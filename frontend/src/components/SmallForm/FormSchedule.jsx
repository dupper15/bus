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
  bus: z.string().nonempty({ message: "Bus ID is required." }),
  line: z.string().nonempty({ message: "Line ID is required." }),
  driver: z.string().nonempty({ message: "Driver ID is required." }),
  busboy: z.string().nonempty({ message: "Bus boy ID is required." }),
  time_start: z.string().nonempty({ message: "Time start is required." }),
});

const FormSchedule = ({ isAdd, handleClose }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bus: "",
      line: "",
      driver: "",
      busboy: "",
      time_start: "",
    },
  });

  const onCreate = (e) => {
    e.preventDefault();
    const values = form.getValues();
    console.log("Form submitted successfully");
    console.log(values);
  };

  return (
    <div className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center -top-10 items-center'>
      <Form {...form}>
        <form
          onSubmit={(e) => onCreate(e)}
          className='w-3/4 max-w-2xl bg-white shadow-lg border border-green-500 rounded-lg p-6 space-y-4'>
          <h1 className='text-2xl font-bold text-green-600 text-center mb-4'>
            {isAdd ? "Add new schedule" : "Edit schedule"}
          </h1>

          <FormField
            control={form.control}
            name='bus'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bus ID</FormLabel>
                <FormControl>
                  <Input placeholder='Bus ID ...' {...field} />
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
                  <Input placeholder='Line ID ...' {...field} />
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
                  <Input placeholder='Driver ID ...' {...field} />
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
                <FormLabel>Bus boy ID</FormLabel>
                <FormControl>
                  <Input placeholder='Bus boy ID ...' {...field} />
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

          <div className='flex justify-center gap-4 pt-2'>
            <button
              onClick={handleClose}
              className='bg-white text-black border border-green-500 py-2 px-4 rounded-md hover:bg-slate-100'>
              Cancel
            </button>
            <button
              type='submit'
              className='bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600'>
              Submit
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormSchedule;
