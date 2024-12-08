import profileIcon from "../../assets/default-profile-icon.png";
import { Link } from "react-router-dom";
import { MdOutlinePerson } from "react-icons/md";
import { RxExit } from "react-icons/rx";

const UserProfileMenu = () => {
  return (
    <div className="profile-dropdown box-border justify-center align-middle pb-2 shadow-lg rounded-2xl bg-white text-black">
      <div className="profile-header flex p-4 w-[250px]">
        <img
          src={profileIcon}
          alt="Profile Image"
          className="profile-image w-[40px] h-[40px] rounded-[50%] object-cover"
        />
        <span className="profile-name font-bold mt-auto mb-auto pl-4">
          Cao Dương Lâm
        </span>
      </div>
      <div className="">
        <Link className="flex mt-2 mb-6 pl-4 hover:text-[#4335DE]" to="">
          <MdOutlinePerson className="h-8 w-8 pr-2" />
          <span className="mt-auto mb-auto">Profile</span>
        </Link>
        <Link className="flex mb-4 pl-4 hover:text-[#4335DE]" to="../">
          <RxExit className="h-8 w-8 pr-2" />
          <span className="mt-auto mb-auto">Log Out</span>
        </Link>
      </div>
    </div>
  );
};
export default UserProfileMenu;
