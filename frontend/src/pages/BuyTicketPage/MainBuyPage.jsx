import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Purchase from "./Purchase";
import Review from "./Review";
import Thanks from "./Thanks";
import Footer from "../../components/Footer/Footer";
import { Stepper, Step } from "react-form-stepper";

const MainBuyPage = () => {
  const location = useLocation();

  const getCurrentStep = () => {
    switch (location.pathname) {
      case "/":
        return 0;
      case "/review":
        return 1;
      case "/thanks":
        return 2;
      default:
        return 0;
    }
  };

  return (
    <div>
      <div className='flex flex-col min-h-screen overflow-x-auto'>
        <div className='h-10 text-center text-4xl font-bold text-[#4CAF50] m-8'>
          BusMap
        </div>
        <div className='flex justify-center items-center h-20 gap-6'>
          <Stepper
            activeStep={getCurrentStep()}
            styleConfig={{
              activeBgColor: "#4CAF50",
              activeTextColor: "#ffffff",
              completedBgColor: "#4CAF50",
              completedTextColor: "#ffffff",
              inactiveBgColor: "#e0e0e0",
              inactiveTextColor: "#ffffff",
            }}
            connectorStyleConfig={{
              activeColor: "#4CAF50",
              completedColor: "#4CAF50",
              disabledColor: "#bdbdbd",
            }}>
            <Step label='Purchase Information' />
            <Step label='Review' />
            <Step label='Thank You' />
          </Stepper>
        </div>
        <div className='flex-grow'>
          <Routes>
            <Route index element={<Purchase />} />
            <Route path='review' element={<Review />} />
            <Route path='thanks' element={<Thanks />} />
          </Routes>
        </div>
        <footer className='mt-auto'>
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default MainBuyPage;
