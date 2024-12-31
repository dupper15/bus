import profileIcon from "../../../assets/default-profile-icon.png";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Message from "../../../components/ui/alert";
import { updateAccount } from "@/redux/accountSlide";
import { useMutation } from "react-query";
import * as AccountService from "../../../services/accountService";
import ChangePassword from "@/components/ChangePassword/ChangePassword";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const account = useSelector((state) => state.account);
  const dispatch = useDispatch();
  const [isEditingUserName, setIsEditingUserName] = useState(false);
  const [userName, setUserName] = useState("");
  const [idCard, setIdCard] = useState("");
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

  const handleUpdateUserName = () => {
    try {
      const values = {
        _id: account?._id,
        id_card: account?.id_card,
        name: userName,
      };
      mutation.mutate({ data: values });
      dispatch(
        updateAccount({
          ...account,
          name: userName,
        })
      );
      setIsEditingUserName(false);
      Message.success("Change user name successfully!");
    } catch (error) {
      Message.error("Failed to change user name !");
      console.error(error);
    }
  };

  const handleViewImage = () => {
    setViewImage(!isViewImage);
  };

  const closeModal = () => {
    setViewImage(false);
  };

  const handleOnChangeImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleUploadImage(file);
    }
  };

  const handleUploadImage = async (file) => {
    try {
      setIsUploading(true);
      const uploadPreset = "afh5sfc";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/ddcjjegzf/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      setImage(result.secure_url);
      dispatch(
        updateAccount({
          ...account,
          image: result.secure_url,
        })
      );
      const values = {
        _id: account?._id,
        id_card: account?.id_card,
        image: result.secure_url,
      };
      mutation.mutate({ data: values });
      Message.success("Change image successfully");
    } catch (error) {
      Message.error("Failed to upload image. Please try again.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (image === profileIcon) {
      Message.error("You cannot remove the default profile image.");
      return;
    }
    try {
      setImage(profileIcon);
      dispatch(
        updateAccount({
          ...account,
          image: profileIcon,
        })
      );
      const values = {
        _id: account?._id,
        id_card: account?.id_card,
        image: profileIcon,
      };
      mutation.mutate({ data: values });
      Message.success("Remove image successfully!");
    } catch (error) {
      Message.error("Failed to remove image. Please try again.");
      console.error(error);
    }
  };

  const mutation = useMutation({
    mutationFn: async ({ data }) => {
      return await AccountService.updateAccount(data);
    },
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    setImage(account?.image || profileIcon);
    setUserName(account?.name);
    setInitialUserName(account?.name);
    setIdCard(account?.id_card);
  }, [account]);

  return (
    <div className='flex flex-col w-full h-full overflow-y-auto bg-white'>
      <div className='flex flex-grow w-full'>
        <div className='flex flex-col w-full overflow-y-auto gap-4 ps-14 pe-20 scrollbar-hide text-black'>
          <span className='font-bold text-xl md:text-3xl mt-6 text-slate-900 pointer-events-none'>
            My Profile
          </span>
          <div>
            <span className='font-semibold text-xl mb-2 text-slate-900 pointer-events-none'>
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
                  className='md:text-m hover:text-green-500 cursor-pointer'
                  htmlFor='image'>
                  Change image
                </label>
                <input
                  type='file'
                  id='image'
                  onChange={handleOnChangeImage}
                  className='hidden'
                  accept='image/jpeg, image/png, image/jpg'></input>
                {isUploading && (
                  <span className='text-sm text-gray-500'>Uploading...</span>
                )}
                <span
                  onClick={handleViewImage}
                  className='md:text-m hover:text-green-500 cursor-pointer'>
                  View image
                </span>
                <span
                  onClick={handleRemoveImage}
                  className='md:text-m hover:text-green-500 cursor-pointer'>
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
                <span className='font-semibold text-xl text-slate-900 pointer-events-none'>
                  Name
                </span>
                {isEditingUserName ? (
                  <input
                    type='text'
                    className='font-thin text-s md:text-m rounded p-1 border text-black'
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
                    <button
                      onClick={handleUpdateUserName}
                      className='w-[80px] h-[40px] font-semibold rounded-lg shadow-sm flex justify-center items-center p-2 bg-green-500 text-white hover:bg-green-600'>
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    className='w-[80px] h-[40px] font-semibold rounded-lg shadow-sm flex justify-center items-center p-2 hover:bg-slate-400 bg-green-500 text-white'
                    onClick={handleEditUserName}>
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className='w-full h-[1px] bg-gray-400 my-4'></div>
            <div className='flex items-center justify-between w-full'>
              <div className='flex flex-col space-y-2'>
                <span className='font-semibold text-xl text-slate-900 pointer-events-none'>
                  Password
                </span>
              </div>
              <Button
                onClick={handleChangePassword}
                className='bg-green-500 hover:bg-green-600 p-1 ml-2 sm:p-4 text-white'>
                Change password
              </Button>
              {isChangePassword && (
                <div className='fixed inset-0 w-full h-full z-10  flex justify-center items-center transition-transform'>
                  <div className='absolute inset-0 bg-black bg-opacity-50 w-screen h-screen backdrop-blur-sm flex justify-center items-center'>
                    <div className='fixed  top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]'>
                      <ChangePassword
                        closeForm={() => setChangePassword(false)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className='w-full h-[1px] bg-gray-400 my-4'></div>
            <div className='flex items-center justify-between w-full'>
              <div className='flex flex-col space-y-2'>
                <span className='font-semibold text-xl text-slate-900 pointer-events-none'>
                  National ID
                </span>
                <span className='font-thin text-s md:text-m'>{idCard}</span>
              </div>
            </div>
            <div className='w-full h-[1px] bg-gray-400 my-4'></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
