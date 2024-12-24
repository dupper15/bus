import { useState } from 'react';

const usePurchasePagesViewModel = () => {
    const [step, setStep] = useState(0);
    const [purchaseData, setPurchaseData] = useState({
        name: '',
        email: '',
        paymentInfo: '',
        billingAddress: '',
        product: 'Bus Pass - monthly subscription',
        price: 30,
        quantity: 1,
        total: 30,
    });

    const nextStep = () => setStep((prevStep) => prevStep + 1);
    const prevStep = () => setStep((prevStep) => prevStep - 1);

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