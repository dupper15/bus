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
import * as EmployeeService from "../../../services/employeeService";
import { useMutation } from "@tanstack/react-query";

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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  name: z
    .string()
    .min(10, { message: "Full name must be at least 10 characters." }),
  password: z
    .string()
    .min(7, { message: "Password must be at least 7 characters." }),
  confirmPassword: z
    .string()
    .min(7, { message: "Password must be at least 7 characters." }),
  phone: z
    .string()
    .length(10, { message: "Phone number must be exactly 10 digits." })
    .regex(/^\d{10}$/, { message: "Phone number must contain only digits." }),
  salary: z
    .string()
    .length(7, { message: "Salary must be at least 1 000 000 VND." }),
  id_card: z
    .string()
    .length(12, { message: "National ID must be exactly 12 digits." })
    .regex(/^\d{12}$/, { message: "National ID must contain only digits." }),

  license: z
    .string()
    .min(6, { message: "License must be at least 6 characters." }),
  gender: z.string().refine((value) => value === "male" || value === "female", {
    message: "Please select a gender.",
  }),
  position: z
    .string()
    .refine((value) => value === "busboy" || value === "driver", {
      message: "Please select a position.",
    }),
});

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async ({ data }) => {
      return await EmployeeService.addEmployee(data);
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      console.log("Data:", data);
    },
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "",
      position: "",
      phone: "",
      id: "",
      password: "",
      confirmPassword: "",
      salary: "",
      hire_date: "",
      license: "",
    },
  });

  const onCreate = (e) => {
    e.preventDefault();
    const values = form.getValues();
    mutation.mutate({ data: values });
    console.log("Form submitted successfully");
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <div className='justify-center pt-4 px-10'>
      <Card>
        <CardHeader className='flex justify-center items-center bg-green-500 h-12 rounded-t-lg mb-8'>
          <CardTitle className='text-white font-semibold text-2xl'>
            Create Employee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => onCreate(e)} className='space-y-6'>
              <div className='flex gap-6'>
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
                          <SelectItem value='male'>Male</SelectItem>
                          <SelectItem value='female'>Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='position'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Position</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a position' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='busboy'>Bus boy</SelectItem>
                          <SelectItem value='driver'>Driver</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Phone Number, National ID */}
              <div className='flex gap-6'>
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
              </div>
              <div className='flex gap-6'>
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
              </div>
              <div className='flex gap-6'>
                <FormField
                  control={form.control}
                  name='salary'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Salary</FormLabel>
                      <FormControl>
                        <Input placeholder='Salary' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='hire_date'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Hire Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            className='w-full text-left font-normal'>
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='license'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Driving License</FormLabel>
                      <FormControl>
                        <Input placeholder='Driving license' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cancel and Create buttons */}
              <div className='flex justify-end space-x-4'>
                <Button
                  onClick={onCancel}
                  variant='outline'
                  className='bg-white border-green-500 text-green-500 hover:bg-green-100'>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='bg-green-500 text-white hover:bg-green-600'>
                  Create
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEmployeePage;
