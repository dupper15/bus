import React from 'react';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import avatar from "../../../assets/default-profile-icon.png";
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const formSchema = z.object({
  fullname: z.string().min(10, {
    message: "Full name must be at least 10 characters.",
  }),
  phonenumber: z.string().length(10, {
    message: "Phone number must be exactly 10 digits.",
  }).regex(/^\d{10}$/, {
    message: "Phone number must contain only digits.",
  }),
  salary: z.string().length(7, {
    message: "Salary must be at least 1 000 000 VND.",
  }).regex(/^\d{10}$/, {
    message: "Salary must contain only digits.",
  }),
  id: z.string().length(12, {
    message: "National ID must be exactly 12 digits.",
  }).regex(/^\d{12}$/, {
    message: "National ID must contain only digits.",
  }),
  gender: z.string().refine((value) => value === "male" || value === "female", {
    message: "Please select a gender.",
  }),
  position: z.string().refine((value) => value === "busboy" || value === "driver", {
    message: "Please select a position.",
  }),
})
 

const DetailEmployeePage = () => {
    const navigate = useNavigate()
    const onBack = () => {
        navigate(-1)
    }
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
      <div className="justify-center pt-4 px-40 ">
      <Card >
      <CardHeader className="relative flex items-center bg-[#4CAF50] rounded-t-lg mb-8">
        {/* Icon Back */}
        <ArrowLeft 
            onClick={onBack} 
            className="absolute left-4 mt-2 cursor-pointer text-white "
            size={40}
        />
        {/* Title */}
        <CardTitle className="text-white font-semibold text-4xl mx-auto">
            Detail Employee
        </CardTitle>
        </CardHeader>
        <CardContent>
        <Form {...form}>
            <form className="space-y-16">
                <div className='flex gap-8'>
                    <div className='w-3/4 space-y-8'>
                        <div className="flex gap-8">
                    {/* Full name */}
                    <FormField
                        control={form.control}
                        name="fullname"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Full name</FormLabel>
                            <FormControl>
                            <Input placeholder="Full name" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {/* Gender */}
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a gender" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {/* Position */}
                    <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Position</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a position" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="busboy">Bus boy</SelectItem>
                                <SelectItem value="driver">Driver</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    <div className="flex gap-8">
                    {/* Phone number */}
                    <FormField
                        control={form.control}
                        name="phonenumber"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Phone number</FormLabel>
                            <FormControl>
                            <Input placeholder="Phone number"  {...field} readOnly/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {/* National ID */}
                    <FormField
                        control={form.control}
                        name="id"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>National ID</FormLabel>
                            <FormControl>
                            <Input placeholder="National ID" {...field} readOnly/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    <div className="flex gap-8">
                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                            <Input placeholder="Password" {...field} readOnly/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    <div className="flex gap-8">
                    {/* Salary */}
                    <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Salary</FormLabel>
                            <FormControl>
                            <Input placeholder="Salary" {...field} readOnly/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {/* Hire date */}
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                        <FormItem className="flex flex-col pt-2.5">
                            <FormLabel>Hire date</FormLabel>
                            <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-[240px] text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                    )}
                                    disabled
                                >
                                    {field.value ? (
                                    format(field.value, "PPP")
                                    ) : (
                                    <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                />
                            </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {/* Lincense */}
                    <FormField
                        control={form.control}
                        name="license"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Driving license</FormLabel>
                            <FormControl>
                            <Input placeholder="Driving license" {...field} readOnly/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    </div>
                    <Avatar className="w-60 h-60 mx-auto my-auto">
                        <AvatarImage src={avatar} className="w-full h-full" />
                        <AvatarFallback className="text-xl">CN</AvatarFallback>
                    </Avatar>
                </div>
            </form>
        </Form>
        </CardContent>
    </Card>
    </div>
  )
};

export default DetailEmployeePage;