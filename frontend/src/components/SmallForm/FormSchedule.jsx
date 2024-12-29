import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import * as ScheduleService from "@/services/scheduleService";
import { useEffect, useState } from "react";
import * as Message from "@/components/ui/alert"


const formSchema = z.object({
  bus: z.string().nonempty({ message: "Bus ID is required." }),
  line: z.string().nonempty({ message: "Line ID is required." }),
  driver: z.string().nonempty({ message: "Driver ID is required." }),
  busboy: z.string().nonempty({ message: "Bus boy ID is required." }),
  time_start: z.string().nonempty({ message: "Time start is required." }),
});

const FormSchedule = ({
  isAdd,
  handleClose,
  schedule
}) => {
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: isAdd === "true"
    ? {
        bus: "",
        line: "",
        driver: "",
        busboy: "",
        time_start: "",
        time: "",
      }
    : {
        bus: schedule.bus._id,
        line: schedule.line._id,
        driver: schedule.driver._id ,
        busboy: schedule.busboy._id,
        time_start: schedule.time_start,
        time: schedule.time,
      },
  });

  const [itemsBus, setItemsBus] = useState([]);
  const [itemsLine, setItemsLine] = useState([]);
  const [itemsDriver, setItemsDriver] = useState([]);
  const [itemsBusboy, setItemsBusboy] = useState([]);

  const mutationGetAllAdd = useMutation({
    mutationFn: () => ScheduleService.getAllAdd(),
    onSuccess: (data) => {
      setItemsBus(data.data.bus);
      setItemsLine(data.data.line);
      setItemsDriver(data.data.driver);
      setItemsBusboy(data.data.busboy);
    },
    onError: (error) => {
      console.error("Error creating bus:", error);
    },
  });
  
  const mutationCreate = useMutation({
    mutationFn: (data) => ScheduleService.createSchedule(data),
    onSuccess: (data) => {
      if (data.status === "OK") {
        Message.success(data.message)
        handleClose();
      } else {
        Message.error(data.message)
      }
    },
    onError: (error) => {
      console.error("Error creating bus:", error);
    },
  });

  const mutationEdit = useMutation({
    mutationFn: (data) => ScheduleService.editSchedule(data),
    onSuccess: (data) => {
      if (data.status === "OK") {
        Message.success(data.message)
        handleClose();
      } else {
        Message.error(data.message)
      }
    },
    onError: (error) => {
      console.error("Error creating bus:", error);
    },
  });

  useEffect(() => {
    mutationGetAllAdd.mutate();
  }, [handleClose])

  const onCreate = (e) => {
    e.preventDefault();
    const values = form.getValues();
    if (isAdd == "true") {
      mutationCreate.mutate(values);
    } else {
      const data = {
        _id: schedule._id,
        ...values
      }
      mutationEdit.mutate(data);
    }
   
  };
  return (
    <div className='absolute inset-0 bg-black bg-opacity-50 -top-10 backdrop-blur-sm flex justify-center items-center'>
      <Form {...form}>
        <form
          onSubmit={(e) => onCreate(e)}
          className='w-3/4 max-w-2xl bg-white shadow-lg border border-green-500 rounded-lg p-6 space-y-4'>
          <h1 className='text-2xl font-bold text-green-600 text-center mb-4'>
            {isAdd == "true" ? "Add New Schedule" : "Edit Schedule"}
          </h1>
                <FormField
                  control={form.control}
                  name='bus'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Bus</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a bus' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {itemsBus.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.license_plate}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='line'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Line</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a line' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {itemsLine.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />    

                <FormField
                  control={form.control}
                  name='driver'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Driver</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a bus' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {itemsDriver.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.name}-{item.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />  

                <FormField
                  control={form.control}
                  name='busboy'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Bus boy</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a bus boy' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {itemsBusboy.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.name}-{item.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            name='time'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type='text' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-center gap-4 pt-2'>
            <button
              onClick={handleClose}
              type='button'
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
