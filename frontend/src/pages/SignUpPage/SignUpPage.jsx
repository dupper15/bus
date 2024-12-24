import React from 'react';

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
import { useMutation } from 'react-query';
import { useNavigate } from "react-router-dom";
import * as Message from "../../components/ui/alert"
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
  })

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
    
    return (<div className='bg-white h-screen w-screen flex'>
        <div className='bg-[#4CAF50] basis-1/3 h-full flex justify-center pt-24'>
            <div className='text-white font-bold text-4xl text-center'>
                <p className='mb-4'>Your journey,</p>
                <p>simplified</p>
            </div>
        </div>

        <div className='bg-white basis-2/3 h-full py-20 px-40 justify-center items-center'>
        <Card>
        <CardHeader className='flex justify-center items-center'>
          <CardTitle className='font-semibold text-4xl'>
            Create account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreate)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Full name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='gender'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a gender' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='Male'>Male</SelectItem>
                          <SelectItem value='Female'>Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              {/* Phone Number, National ID */}
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder='Phone number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder='Username' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='id_card'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>National ID</FormLabel>
                      <FormControl>
                        <Input placeholder='National ID' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Confirm password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              {/* Create buttons */}
              <div className='flex justify-center'>
                <Button
                  // onClick={onCreate}
                  type='submit'
                  className='bg-green-500 text-white hover:bg-green-600'>
                  Register
                </Button>
              </div>
              <div className='text-sm text-gray-600'>
                    Already have an account?{' '}
                    <a
                        className='text-[#0A74DA] font-semibold hover:cursor-pointer'
                        href='/login'
                    >
                        Login
                    </a>
                </div>
            </form>
          </Form>
        </CardContent>
      </Card>
        </div>
    </div>);
};

export default SignUpPage;