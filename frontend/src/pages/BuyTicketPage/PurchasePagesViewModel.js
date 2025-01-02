import { useState } from "react";

const usePurchasePagesViewModel = () => {
  const [step, setStep] = useState();
  const [purchaseData, setPurchaseData] = useState({
    name: "",
    email: "",
    paymentInfo: "",
    billingAddress: "",
    product: "Bus Pass - monthly subscription",
    price: 30,
    quantity: 1,
    total: 30,
  });

  const nextStep = () => setStep(1);
  const prevStep = () => setStep(0);

  const updatePurchaseData = (newData) => {
    setPurchaseData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  return {
    step,
    purchaseData,
    nextStep,
    prevStep,
    updatePurchaseData,
  };
};

export default usePurchasePagesViewModel;
