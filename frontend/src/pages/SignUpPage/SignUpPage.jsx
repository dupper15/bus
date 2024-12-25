import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import * as Message from "../../components/ui/alert";
import * as CustomerService from "../../services/customerService";

const formSchema = z
  .object({
    name: z
      .string()
      .min(10, { message: "Full name must be at least 10 characters." }),
    username: z
      .string()
      .min(6, { message: "Username must be at least 6 characters." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    phone: z
      .string()
      .length(10, { message: "Phone number must be exactly 10 digits." })
      .regex(/^\d{10}$/, { message: "Phone number must contain only digits." }),
    id_card: z
      .string()
      .length(12, { message: "National ID must be exactly 12 digits." })
      .regex(/^\d{12}$/, { message: "National ID must contain only digits." }),
    gender: z
      .string()
      .refine((value) => value === "Male" || value === "Female", {
        message: "Please select a gender.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Định nghĩa trường hiển thị lỗi
  });

const SignUpPage = () => {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "",
      phone: "",
      id_card: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ data }) => {
      return await CustomerService.createCustomer(data);
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
        navigate("/login");
      }
    },
  });

  const onCreate = async () => {
    const isValid = await form.trigger();

    if (!isValid) {
      console.log("Validation errors:", form.formState.errors); // Log lỗi nếu có
      return; // Dừng lại nếu form có lỗi
    }
    const values = form.getValues();
    console.log(values);
    mutation.mutate({ data: values });
  };

  return (
    <div className="bg-white h-screen w-screen flex">
      <div className="relative bg-green-500 basis-1/3 h-screen flex justify-center items-center px-10">
        <div className="text-white font-bold text-5xl text-center leading-snug -mt-40">
          <p>Your journey,</p>
          <p>simplified</p>
        </div>
        <div className="absolute bottom-0 w-full">
          <svg
            viewBox="0 0 1440 320"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,160L30,149.3C60,139,120,117,180,133.3C240,149,300,203,360,197.3C420,192,480,128,540,128C600,128,660,192,720,186.7C780,181,840,107,900,90.7C960,75,1020,117,1080,154.7C1140,192,1200,224,1260,213.3C1320,203,1380,149,1410,122.7L1440,96L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <div className="bg-gray-100 basis-2/3 h-full py-10 px-40 justify-center items-center">
        <Card className="shadow-lg rounded-lg">
          <CardHeader className="flex justify-center items-center">
            <CardTitle className="font-semibold text-5xl">
              Create a new account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCreate)}
                className="grid grid-cols-1 md:grid-cols-2 space-x-6 space-y-2 pr-5">
                <h1 className="pl-6 pt-2">Personal Information</h1>
                <h1>Account Information</h1>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Phone Number, National ID */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="id_card"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>National ID</FormLabel>
                      <FormControl>
                        <Input placeholder="National ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Create buttons */}
                <div className="flex justify-center col-span-2 pt-5">
                  <Button
                    // onClick={onCreate}
                    type="submit"
                    className="bg-green-500 text-white hover:bg-green-600 px-6 py-3">
                    Register
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a
                    className="text-[#0A74DA] font-semibold hover:cursor-pointer hover:underline"
                    href="/login">
                    Login
                  </a>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;
