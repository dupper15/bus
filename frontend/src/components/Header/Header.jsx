import { useState } from "react";
import { Menu, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/home');
  };

  return (
      <div className="flex items-center justify-between w-full h-10 px-5 py-8 bg-white shadow-sm border-b border-gray-200">
        <div className="flex-1">
          <ChevronLeft
              className="h-6 w-6 text-emerald-600 cursor-pointer hover:text-emerald-700 transition-colors"
              onClick={handleBack}
          />
        </div>

        <div className="flex-1 flex justify-center">
          <h1 className="text-2xl font-bold text-emerald-600 tracking-wide">
            BUSTY
          </h1>
        </div>

        <div className="flex-1 flex justify-end">
          <Menu className="h-6 w-6 text-gray-600 cursor-pointer hover:text-emerald-600 transition-colors" />
        </div>
      </div>
  );
};

export default Header;