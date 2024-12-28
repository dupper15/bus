import profileIcon from "../../assets/default-profile-icon.png";
import useProfileViewModel from "./ProfileViewModel";

const ProfilePage = () => {
  const {
    profile,
    loading,
    error,
    handleInputChange,
    handleSubmit,
    handleLogout,
  } = useProfileViewModel();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='flex flex-grow w-full  bg-white text-black'>
      <div className='flex flex-col w-full overflow-y-auto gap-6 ps-14 pe-20 scrollbar-hide'>
        {/* Title */}
        <span className='font-bold text-2xl md:text-3xl text-green-500 mt-10'>
          My Profile
        </span>

        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div>
            <span className='font-semibold text-lg md:text-xl'>Avatar</span>
            <div className='flex items-center justify-between mt-3'>
              <img
                className='object-cover w-[100px] h-[100px] rounded-full cursor-pointer shadow-md'
                src={
                  typeof profile.image === "string"
                    ? profile.image
                    : profileIcon
                }
                alt='Profile Image'
              />
              <div className='flex flex-col text-right space-y-2'>
                <span className='text-sm md:text-base text-green-500 hover:underline cursor-pointer'>
                  Change image
                </span>
                <span className='text-sm md:text-base text-green-500 hover:underline cursor-pointer'>
                  View image
                </span>
                <span className='text-sm md:text-base text-green-500 hover:underline cursor-pointer'>
                  Remove photo
                </span>
              </div>
            </div>
            <div className='w-full h-[1px] bg-gray-300 my-6'></div>
          </div>

          {/* Username Section */}
          <div className='flex items-center justify-between'>
            <div className='flex flex-col space-y-2'>
              <span className='font-semibold text-lg md:text-xl'>Username</span>
              <input
                type='text'
                name='name'
                value={profile.name || "Default Name"}
                onChange={handleInputChange}
                className='font-light text-sm md:text-base border border-gray-300 rounded-md px-3 py-2 w-[250px] focus:outline-green-500'
              />
            </div>
            <button
              type='submit'
              className='w-[80px] h-[40px] bg-green-500 hover:bg-green-400 text-white font-semibold rounded-md shadow-md'>
              Save
            </button>
          </div>
          <div className='w-full h-[1px] bg-gray-300 my-6'></div>

          {/* Email Section */}
          <div className='flex flex-col space-y-2'>
            <span className='font-semibold text-lg md:text-xl'>Email</span>
            <input
              type='text'
              name='id_card'
              value={profile.id_card || "Default Email"}
              onChange={handleInputChange}
              className='font-light text-sm md:text-base border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-green-500'
            />
          </div>
          <div className='w-full h-[1px] bg-gray-300 my-6'></div>

          {/* Phone and Logout Section */}
          <div className='flex items-center justify-between'>
            <div className='flex flex-col space-y-2'>
              <span className='font-semibold text-lg md:text-xl'>Phone</span>
              <input
                type='text'
                name='phone'
                value={profile.phone || "Default Phone"}
                onChange={handleInputChange}
                className='font-light text-sm md:text-base border border-gray-300 rounded-md px-3 py-2 w-[250px] focus:outline-green-500'
              />
            </div>
            <button
              type='button'
              onClick={handleLogout}
              className='bg-green-500 hover:bg-green-400 text-white font-semibold rounded-md shadow-md px-4 py-2'>
              Logout
            </button>
          </div>
          <div className='w-full h-[1px] bg-gray-300 my-6'></div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
