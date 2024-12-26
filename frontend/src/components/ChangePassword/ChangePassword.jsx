const ChangePassword = ({ closeForm }) => {
  return (
    <div className="relative h-[400px] w-[600px] flex-column items-center justify-center p-6 rounded-lg shadow-lg text-center bg-gray-100">
      <button
        onClick={closeForm}
        className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">
        ×
      </button>
      <h2 className="text-lg font-semibold mb-6 text-black">Change password</h2>
      <div>
        <input
          name="password"
          type="text"
          placeholder="Enter current password..."
          className="w-full p-3 mb-4 border-2 border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 bg-white text-black"
        />
      </div>
      <div>
        <input
          name="new_password"
          type="password"
          placeholder="Enter new password..."
          className="w-full p-3 mb-4 border-2 border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 bg-white text-black"
        />
      </div>
      <div>
        <input
          name="confirm_password"
          type="password"
          placeholder="Enter confirm password..."
          className="w-full p-3 mb-4 border-2 border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 bg-white text-black"
        />
      </div>
      <button className="w-[120px] py-3 mt-4 font-bold text-white rounded-md bg-gradient-to-r from-lime-300 to-green-500 hover:opacity-90">
        Save
      </button>
    </div>
  );
};

export default ChangePassword;
