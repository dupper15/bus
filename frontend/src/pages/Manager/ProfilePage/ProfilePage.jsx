import profileIcon from "../../../assets/default-profile-icon.png";
import { FaGoogle, FaFacebook } from "react-icons/fa6";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const [isEditingUserName, setIsEditingUserName] = useState(false);
  const [userName, setUserName] = useState("");
  const [initialUserName, setInitialUserName] = useState("");

  const [isChangePassword, setChangePassword] = useState(false);

  const [image, setImage] = useState(profileIcon);
  const [isUploading, setIsUploading] = useState(false);
  const [isViewImage, setViewImage] = useState(false);

  const handleOnChangeUserName = (e) => {
    setUserName(e.target.value);
  };

  const handleEditUserName = () => {
    setIsEditingUserName(!isEditingUserName);
  };

  const handleChangePassword = () => {
    setChangePassword(!isChangePassword);
  };

  const handleCancelClick = () => {
    setUserName(initialUserName);
    setIsEditingUserName(false);
  };

  const handleViewImage = () => {
    setViewImage(!isViewImage);
  };

  const closeModal = () => {
    setViewImage(false);
  };

  return (
    <div
      className='flex flex-col h-full overflow-y-auto 
        "bg-white"
      '>
      <div className='flex flex-grow '>
        <div
          className='flex flex-col w-full overflow-y-auto gap-4 ps-14 pe-20 scrollbar-hide ${
           text-black
          '>
          <span className='font-bold text-xl md:text-3xl pointer-events-none'>
            My Profile
          </span>
          <div>
            <span className='font-semibold text-xl pointer-events-none'>
              Avatar
            </span>
            <div className='flex items-center justify-between'>
              <label htmlFor='upload-avatar' className='cursor-pointer'>
                <img
                  className='object-cover w-[100px] h-[100px] rounded-full'
                  src={image}
                  alt='Profile Avatar'
                />
              </label>
              <div className='flex flex-col text-right cursor-pointer space-y-2'>
                <label
                  className='md:text-m hover:text-[#4335DE] cursor-pointer'
                  htmlFor='image'>
                  Change image
                </label>
                <input
                  type='file'
                  id='image'
                  className='hidden'
                  accept='image/jpeg, image/png, image/jpg'></input>
                {isUploading && (
                  <span className='text-sm text-gray-500'>Uploading...</span>
                )}
                <span
                  onClick={handleViewImage}
                  className='md:text-m hover:text-[#4335DE] cursor-pointer'>
                  View image
                </span>
                <span className='md:text-m hover:text-[#4335DE] cursor-pointer'>
                  Remove photo
                </span>
              </div>
            </div>
            {isViewImage && (
              <div
                className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
                onClick={closeModal}>
                <div
                  className='bg-white rounded shadow-lg relative'
                  onClick={(e) => e.stopPropagation()}>
                  <img
                    src={image}
                    alt='Profile Image'
                    className='object-fill w-[640px] h-[360px] rounded'
                  />
                </div>
              </div>
            )}
            <div className='w-full h-[1px] bg-gray-400 my-4'></div>
            <div className='flex items-center justify-between w-full'>
              <div className='flex flex-col space-y-2'>
                <span className='font-semibold text-xl pointer-events-none'>
                  Nickname
                </span>
                {isEditingUserName ? (
                  <input
                    type='text'
                    className='font-thin text-s md:text-m rounded p-1 border 
                      text-black
                    '
                    value={userName}
                    onChange={handleOnChangeUserName}
                  />
                ) : (
                  <span className='font-thin text-s md:text-m'>{userName}</span>
                )}
              </div>
              <div className='flex space-x-2 mt-2'>
                {isEditingUserName ? (
                  <>
                    <button
                      className='w-[80px] h-[40px] font-semibold rounded-lg shadow-sm flex justify-center items-center p-2 bg-red-500 text-white hover:bg-red-600'
                      onClick={handleCancelClick}>
                      Cancel
                    </button>
                    <button className='w-[80px] h-[40px] font-semibold rounded-lg shadow-sm flex justify-center items-center p-2 bg-green-500 text-white hover:bg-green-600'>
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    className='w-[80px] h-[40px] font-semibold rounded-lg shadow-sm flex justify-center items-center p-2 hover:bg-slate-400 ${
                     bg-white text-black'
                    onClick={handleEditUserName}>
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className='w-full h-[1px] bg-gray-400 my-4'></div>
            <div className='flex flex-col justify-between w-full space-y-2'>
              <span className='font-semibold text-xl pointer-events-none'>
                Email
              </span>
              <span className='font-thin text-s md:text-m pointer-events-none'>
                hello
              </span>
            </div>
            <div className='w-full h-[1px] bg-gray-400 my-4'></div>
            <div className='flex items-center justify-between w-full'>
              <div className='flex flex-col space-y-2'>
                <span className='font-semibold text-xl pointer-events-none'>
                  Password
                </span>
              </div>
              <button
                className='w-[auto] h-[40px] font-semibold rounded-lg shadow-sm flex justify-center items-center px-3 py-2 hover:bg-slate-400 ${
                  bg-white text-black
                '
                onClick={handleChangePassword}>
                Change Password
              </button>
            </div>
            <div className='w-full h-[1px] bg-gray-400 my-4'></div>
            <div className='flex flex-col space-y-2'>
              <span className='font-semibold text-xl pointer-events-none'>
                Social Media
              </span>
              <span className='font-thin text-s pointer-events-none'>
                Services you have used
              </span>
            </div>
            <div
              className='flex flex-row items-center w-max md:w-full h-[auto] border-2 rounded-lg my-2 py-3 px-2 ${
                border-white
              '>
              <div className='flex flex-row items-center'>
                <FaGoogle className='h-[40px] w-[40px]' />
                <div className='flex flex-col px-4'>
                  <span className='font-semibold text-xl pointer-events-none'>
                    Google
                  </span>
                  <span className='font-thin text-s pointer-events-none'>
                    heloo@gmail.com
                  </span>
                </div>
              </div>
              <button
                className='w-[auto] h-[40px] ml-auto font-semibold rounded-lg shadow-sm flex justify-center items-center px-3 py-2 hover:bg-slate-400 ${
                  bg-white text-black
                '>
                Connect
              </button>
            </div>
            <div
              className='flex flex-row items-center w-max md:w-full h-[auto] border-2 rounded-lg my-2 py-3 px-2 ${
                border-black'>
              <div className='flex flex-row items-center'>
                <FaFacebook className='h-[40px] w-[40px]' />
                <div className='flex flex-col px-4'>
                  <span className='font-semibold text-xl pointer-events-none'>
                    Facebook
                  </span>
                  <span className='font-thin text-s pointer-events-none'>
                    caoduonglam@gmail.com
                  </span>
                </div>
              </div>
              <button
                className='w-[auto] h-[40px] ml-auto font-semibold rounded-lg shadow-sm flex justify-center items-center px-3 py-2 hover:bg-slate-400 ${
                 bg-white text-black
                '>
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
