import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import img from "../../assets/bus.jpeg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as AccountService from "@/services/accountService"
import * as Message from "@/components/ui/alert";
import { useMutation } from "react-query";
import { useSelector } from "react-redux";

const formSchema = z
  .object({
    new_password: z.string(),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords must match",
    path: ["confirm_password"], // Định nghĩa trường hiển thị lỗi
  });

const ChangePassword = ({ closeForm }) => {
  const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
          password: "",
          new_password: "",
          confirm_password: "",
        },
      });

  const account = useSelector((state) => state.account);

  const onChange = async() => {
    const isValid = await form.trigger();

    if (!isValid) {
      console.log("Validation errors:", form.formState.errors); // Log lỗi nếu có
      return; // Dừng lại nếu form có lỗi
    }
    const input = form.getValues();
    const values = {
      id_card: account?.id_card,
      password: input.password,
      new_password: input.new_password,
    };
    mutaionChangePassword.mutate({ data: values });
  };

  const mutaionChangePassword = useMutation({
    mutationFn: async ({ data }) => {
      return await AccountService.changePassword(data);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      Message.error(errorMessage); // Hiển thị lỗi
    },
    onSuccess: (data) => {
      if (data.status === "OK") {
        Message.success(data.message); // Hiển thị thông báo thành công
        closeForm();
      } else {
        Message.error(data.message); // Hiển thị lỗi từ API
      }
    },
  });

  return (   
      <Card className="shadow-lg rounded-lg w-[500px] bg-white relative">
      <button
        onClick={closeForm}
        className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">
        ×
      </button>
          <CardHeader className="flex justify-center items-center">
            <CardTitle className="font-semibold p-3 text-5xl text-transparent bg-gradient-to-r from-green-400 to-green-600 bg-clip-text">
              Change password
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center px-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onChange)}
                className="space-y-6 w-full">
                            <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Passowrd" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="new_password"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>New password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="New password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                             />
                            <FormField
                              control={form.control}
                              name="confirm_password"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Confirm password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Confirm password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                             />
                    <div className="flex justify-center col-span-2 pt-5">
                      <Button
                        type="submit"
                        className="bg-green-500 text-white hover:bg-green-600 px-10 py-3">
                        Save
                      </Button>
                    </div>            
                    </form>
                </Form> 
          </CardContent>
        </Card>
  );
};

export default ChangePassword;
