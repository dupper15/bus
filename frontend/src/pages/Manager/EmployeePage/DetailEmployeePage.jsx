import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
const formSchema = z.object({
  fullname: z.string().min(10, {
    message: "Full name must be at least 10 characters.",
  }),
  phonenumber: z
    .string()
    .length(10, {
      message: "Phone number must be exactly 10 digits.",
    })
    .regex(/^\d{10}$/, {
      message: "Phone number must contain only digits.",
    }),
  salary: z
    .string()
    .length(7, {
      message: "Salary must be at least 1 000 000 VND.",
    })
    .regex(/^\d{10}$/, {
      message: "Salary must contain only digits.",
    }),
  id: z
    .string()
    .length(12, {
      message: "National ID must be exactly 12 digits.",
    })
    .regex(/^\d{12}$/, {
      message: "National ID must contain only digits.",
    }),
  gender: z.string().refine((value) => value === "male" || value === "female", {
    message: "Please select a gender.",
  }),
  position: z
    .string()
    .refine((value) => value === "busboy" || value === "driver", {
      message: "Please select a position.",
    }),
});

const DetailEmployeePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      gender: "",
      position: "",
      phonenumber: "",
      id: "",
      password: "",
      confirm: "",
      salary: "",
      date: "",
      license: "",
    },
  });
  return (
    <div className='flex justify-center pt-4 px-10 bg-gray-50 min-h-screen'>
      <Card className='w-full bg-white shadow-lg rounded-lg border border-gray-300'>
        <CardHeader className='flex justify-center items-center bg-green-500 h-14 rounded-t-lg mb-8'>
          <CardTitle className='text-white font-bold text-2xl'>
            Edit Employee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className='space-y-6'>
              <div className='flex gap-6'>
                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name='nationalId'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel className='text-green-500 font-semibold'>
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter phone number'
                          className='border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* National ID */}
                <FormField
                  control={form.control}
                  name='id'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel className='text-green-500 font-semibold'>
                        National ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter ID'
                          className='border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500'
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
                  name='fullname'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel className='text-green-500 font-semibold'>
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter full name'
                          className='border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Gender */}
                <FormField
                  control={form.control}
                  name='gender'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel className='text-green-500 font-semibold'>
                        Gender
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500'>
                            <SelectValue placeholder='Select gender' />
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
              </div>
              <div className='flex gap-6'>
                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name='phonenumber'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel className='text-green-500 font-semibold'>
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter phone number'
                          className='border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* National ID */}
                <FormField
                  control={form.control}
                  name='id'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel className='text-green-500 font-semibold'>
                        National ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter ID'
                          className='border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex gap-6'>
                {/* Salary */}
                <FormField
                  control={form.control}
                  name='salary'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel className='text-green-500 font-semibold'>
                        Salary
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter salary'
                          className='border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Hire Date */}
                <FormField
                  control={form.control}
                  name='date'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel className='text-green-500 font-semibold'>
                        Hire Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className={cn(
                                "w-full border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500",
                                !field.value && "text-muted-foreground"
                              )}>
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Submit Button */}
              <div className='flex justify-end'>
                <Button
                  type='submit'
                  className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600'>
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailEmployeePage;
