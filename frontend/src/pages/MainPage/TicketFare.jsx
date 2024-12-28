import React from "react";
import image from "../../assets/image 2.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TicketFare = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row w-full h-full p-6 bg-gradient-to-r from-blue-50 to-green-50">
  {/* Left Section */}
  <div className="md:basis-2/5 flex flex-col px-4 md:px-8 gap-6 justify-center">
    <h1 className="text-4xl font-extrabold text-green-600">
      Fares and Tickets
    </h1>
    <p className="text-xl font-medium text-gray-700">
      Your One-Stop Ticket to the City
    </p>
    <p className="text-base text-gray-600 leading-relaxed">
      Experience hassle-free travel with our convenient ticketing system,
      designed to make your journey smooth and enjoyable.
    </p>
    <h2 className="text-2xl font-semibold text-green-600">Our Offerings:</h2>
    <div className="p-6 rounded-lg bg-white shadow-md hover:shadow-xl transition transform duration-200 ease-in-out flex flex-col items-center">
      <h3 className="text-2xl text-center font-semibold text-green-500">Monthly Ticket</h3>
      <p className="text-4xl text-center font-bold text-gray-800 my-2">50.000 VND</p>
      <div className="text-center space-y-1">
        <p className="text-gray-500 text-base">🕒 Validity: <span className="text-gray-800">30 days</span></p>
        <p className="text-gray-500 text-base">🚌 Usage: <span className="text-gray-800">All bus routes</span></p>
        <p className="text-gray-500 text-base">📍 Locale: <span className="text-gray-800">Ho Chi Minh City</span></p>
      </div>
      <button onClick={() => navigate("/payment")} className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 mt-4 rounded-md">
        Buy Now
      </button>
    </div>
  </div>

  {/* Right Section */}
  <div
    className="md:basis-3/5 rounded-lg shadow-lg"
    style={{
      backgroundImage: `url(${image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  />
</div>

  );
};

export default TicketFare;
