import React from "react";
import { Route, Routes } from "react-router-dom";
import Purchase from "./Purchase";
import Review from "./Review";
import Thanks from "./Thanks";
import Footer from "../../components/Footer/Footer";
import { Stepper, Step } from "react-form-stepper";
import usePurchasePagesViewModel from "@/pages/BuyTicketPage/PurchasePagesViewModel.js";

const MainBuyPage = () => {
  const { step, nextStep, prevStep } = usePurchasePagesViewModel();

  return (
    <div className='flex flex-col min-h-screen bg-white text-black'>
      {/* Header */}
      <div className='text-center py-4 bg-green-500 text-white'>
        <h1 className='text-2xl font-bold'>BusMap</h1>
      </div>

      {/* Stepper */}
      <div className='flex justify-center items-center px-4'>
        <Stepper
          activeStep={step}
          styleConfig={{
            activeBgColor: "#22c55e",
            activeTextColor: "#ffffff",
            completedBgColor: "#22c55e",
            completedTextColor: "#ffffff",
            inactiveBgColor: "#e0e0e0",
            inactiveTextColor: "#757575",
          }}
          connectorStyleConfig={{
            activeColor: "#22c55e",
            completedColor: "#22c55e",
            disabledColor: "#bdbdbd",
          }}>
          <Step label='Purchase Info' />
          <Step label='Thank You' />
        </Stepper>
      </div>

      {/* Content */}
      <div className='flex-grow gap-2 sm:gap-4'>
        <Routes>
          <Route index element={<Purchase prevStep={prevStep} />} />
          <Route path='thanks' element={<Thanks nextStep={nextStep} />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className='bg-green-500 text-white text-center py-3'>
        <Footer />
      </footer>
    </div>
  );
};

export default MainBuyPage;
