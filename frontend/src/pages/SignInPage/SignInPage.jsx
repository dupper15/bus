import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "react-query";
import { jwtDecode } from "jwt-decode";
import * as Account from "../../services/accountService";
import * as Message from "../../components/ui/alert";
import { updateAccount } from "@/redux/accountSlide";
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

const formSchema = z.object({
  id_card: z
    .string()
    .length(12, { message: "National ID must be exactly 12 digits." })
    .regex(/^\d{12}$/, { message: "National ID must contain only digits." }),
});

const SignInPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_card: "",
      password: "",
    },
  });

  const handleGetDetailAccount = async (id, token) => {
    const res = await Account.getDetailAccount(id, token);
    dispatch(updateAccount({ ...res?.data, access_token: token }));
  };

  const mutationLogin = useMutation({
    mutationFn: async ({ data }) => {
      return await Account.loginAccount(data);
    },
    onSuccess: (data) => {
      if (data.status === "OK" || data.message === "Login successfully.") {
        Message.success(data.message);
        localStorage.setItem(
          "access_token",
          JSON.stringify(data?.access_token)
        );
        if (data?.access_token) {
          const decoded = jwtDecode(data?.access_token);
          if (decoded?.id) {
            handleGetDetailAccount(decoded?.id, data?.access_token);
          }
        }
        if (data.userType === "Customer") {
          navigate("/home");
        } else if (data.userType === "Employee") {
          navigate("/employee");
        } else if (data.userType === "Manager") {
          navigate("/manage");
        } else if (data.userType === "Admin") {
          navigate("/admin");
        }
      } else {
        Message.error(data.message);
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const onLogin = async () => {
    const isValid = await form.trigger();

    if (!isValid) {
      console.log("Validation errors:", form.formState.errors); // Log lỗi nếu có
      return; // Dừng lại nếu form có lỗi
    }
    const values = form.getValues();
    mutationLogin.mutate({ data: values });
  };

  return (
    <div className='bg-white h-screen w-screen flex'>
      <div
        className='relative bg-green-500 basis-1/3 h-screen flex justify-center items-center px-10'
        style={{
          backgroundImage: `url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        <div className='text-white font-bold text-5xl text-center leading-snug -mt-40'>
          <p>Your journey,</p>
          <p>simplified</p>
        </div>
        <div className='absolute bottom-0 w-full'>
          <svg
            viewBox='0 0 1440 320'
            xmlns='http://www.w3.org/2000/svg'
            className='w-full'>
            <path
              fill='#ffffff'
              fillOpacity='0.5'
              d='M0,160L30,149.3C60,139,120,117,180,133.3C240,149,300,203,360,197.3C420,192,480,128,540,128C600,128,660,192,720,186.7C780,181,840,107,900,90.7C960,75,1020,117,1080,154.7C1140,192,1200,224,1260,213.3C1320,203,1380,149,1410,122.7L1440,96L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z'></path>
          </svg>
        </div>
      </div>

      <div className='bg-gray-100 basis-2/3 h-full justify-center items-center place-items-center pt-36'>
        <Card className='shadow-lg rounded-lg w-[400px] bg-white'>
          <CardHeader className='flex justify-center items-center'>
            <CardTitle className='font-semibold p-3 text-3xl text-transparent bg-gradient-to-r from-green-400 to-green-600 bg-clip-text'>
              Log in
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col items-center px-6'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onLogin)}
                className='space-y-6 w-full'>
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
                <div className='flex justify-center col-span-2 pt-5'>
                  <Button
                    // onClick={onCreate}
                    type='submit'
                    className='bg-green-500 text-white hover:bg-green-600 px-10 py-3'>
                    Login
                  </Button>
                </div>
              </form>
            </Form>
            <div className='w-full h-[1px] bg-slate-300 my-4'></div>
            <div className='text-sm text-gray-600'>
              Don&apos;t have an account?{" "}
              <a
                className='text-[#0A74DA] font-semibold hover:cursor-pointer hover:underline'
                href='/signup'>
                Sign up
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignInPage;
