import profileIcon from "../../assets/default-profile-icon.png";
import useProfileViewModel from "./ProfileViewModel";

const ProfilePage = () => {
  const {
    profile,
    loading,
    error,
    handleInputChange,
    handleSubmit,
    handleLogout
  } = useProfileViewModel();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
      <div className='flex flex-grow w-6/7'>
        <div className={`flex flex-col w-full overflow-y-auto gap-4 ps-14 pe-20 scrollbar-hide text-black`}>
        <span className='font-bold text-xl md:text-3xl pointer-events-none text-[#4CAF50] mt-10'>
          My Profile
        </span>
          <form onSubmit={handleSubmit}>
            <div>
            <span className='font-semibold text-xl pointer-events-none'>
              Avatar
            </span>
              <div className='flex items-center justify-between'>
                <img
                    className='object-cover w-[100px] h-[100px] rounded-full mt-3 cursor-pointer'
                    src={typeof profile.image === 'string' ? profile.image : profileIcon}
                    alt='Profile Image'
                />
                <div className='flex flex-col text-right cursor-pointer space-y-2'>
                <span className='md:text-m hover:text-[#4CAF50] cursor-pointer'>
                  Change image
                </span>
                  <span className='md:text-m hover:text-[#4CAF50] cursor-pointer'>
                  View image
                </span>
                  <span className='md:text-m hover:text-[#4CAF50] cursor-pointer'>
                  Remove photo
                </span>
                </div>
              </div>
              <div className='w-full h-[1px] bg-gray-400 my-4'></div>
              <div className='flex items-center justify-between w-full'>
                <div className='flex flex-col space-y-2'>
                <span className='font-semibold text-xl pointer-events-none'>
                  Username
                </span>
                  <input
                      type='text'
                      name='name'
                      value={profile.name || 'Default Name'}
                      onChange={handleInputChange}
                      className='font-thin text-s md:text-m pointer-events-none'
                  />
                </div>
                <button
                    type='submit'
                    className={`w-[80px] h-[40px] font-semibold text-white rounded-lg shadow-sm flex justify-center items-center p-2 bg-[#4CAF50] hover:bg-[#8ce58f] `}>
                  Save
                </button>
              </div>
              <div className='w-full h-[1px] bg-gray-400 my-4'></div>
              <div className='flex flex-col justify-between w-full space-y-2'>
              <span className='font-semibold text-xl pointer-events-none'>
                Email
              </span>
                <input
                    type='text'
                    name='id_card'
                    value={profile.id_card || 'Default Email'}
                    onChange={handleInputChange}
                    className='font-thin text-s md:text-m pointer-events-none'
                />
              </div>
              <div className='w-full h-[1px] bg-gray-400 my-4'></div>
              <div className='flex items-center justify-between w-full'>
                <div className='flex flex-col space-y-2'>
                <span className='font-semibold text-xl pointer-events-none'>
                  Phone
                </span>
                  <input
                      type='text'
                      name='phone'
                      value={profile.phone || 'Default Phone'}
                      onChange={handleInputChange}
                      className='font-thin text-s md:text-m pointer-events-none'
                  />
                </div>
                <button
                    type='button'
                    onClick={handleLogout}
                    className={`w-[auto] h-[40px] text-white font-semibold rounded-lg shadow-sm flex justify-center items-center px-3 py-2 bg-[#4CAF50] hover:bg-[#8ce58f] `}>
                  Logout
                </button>
              </div>
              <div className='w-full h-[1px] bg-gray-400 my-4'></div>
            </div>
          </form>
        </div>
      </div>
  );
};

export default ProfilePage;