import { date, z } from "zod";
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
  type: z.enum(["Reward", "Punishment"], { message: "Invalid type." }),
  content: z.string().nonempty({ message: "Content is required." }),
  date: z.string().nonempty({ message: "Time start is required." }),
  price: z.string().refine((value) => /^\d+$/.test(value), {
    message: "Price must be a valid number.",
  }),
});

const FormIncentives = ({
  isAdd,
  handleClose,
  id = "",
  name = "",
  type = "",
  content = "",
  date = "",
  price = "",
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      type,
      content,
      date,
      price,
    },
  });

  const onCreate = (e) => {
    e.preventDefault();
    const values = form.getValues();
    console.log("Form submitted successfully:", values);
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 -top-10 backdrop-blur-sm flex justify-center items-center">
      <Form {...form}>
        <form
          onSubmit={onCreate}
          className="w-full max-w-2xl bg-white shadow-lg border rounded-lg p-6 space-y-6">
          <h1 className="text-2xl font-bold text-green-500 text-center">
            {isAdd === "true" ? "Add New Incentive" : "Edit Incentive"}
          </h1>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6">
            {isAdd === "false" && (
              <div className="flex flex-col space-y-2">
                <FormLabel>Incentive ID:</FormLabel>
                <div className="text-gray-700 bg-gray-100 p-2 rounded border">
                  {id}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Employee Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Type(Reward/Punishment)..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Content..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Date..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Price..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={handleClose}
              type="button"
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-400">
              Submit
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormIncentives;
