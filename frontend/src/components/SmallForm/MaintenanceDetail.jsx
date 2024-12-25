import { IoIosArrowBack } from "react-icons/io";

const MaintenanceDetail = ({ handleClose, content, title }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 w-screen h-screen backdrop-blur-sm flex justify-center items-center">
      <div className="relative w-3/4 max-w-2xl bg-white shadow-lg border border-slate-500 rounded-lg p-8 space-y-6">
        <div className="flex-col">
          <IoIosArrowBack
            onClick={handleClose}
            className="text-xl cursor-pointer"
          />
          <h1 className="text-3xl font-bold text-green-500 text-center">
            Maintenance Detail
          </h1>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <h3 className="text-green-600 font-bold mb-2">
              {title || "No title provided"}
            </h3>
            <p className="text-gray-700">{content || "No content provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetail;
