import { useState } from "react";
import profileIcon from "../../assets/default-profile-icon.png";
import UserProfileMenu from "../UserProfileMenu/UserProfileMenu";

const Header = () => {
  const [openProfile, setOpenProfile] = useState(false);

  return (
    <div className="flex items-center justify-between w-full h-10 px-5 py-8 bg-white">
      <div className="flex items-center justify-items-start gap-2">
        <div className="w-[40px] h-[40px] bg-[url('./assets/logo.png')] bg-cover bg-center" />
        <div className="text-3xl font-bold hover:cursor-pointer text-black">
          Busty
        </div>
      </div>
      <div className="flex flex-row items-center justify-center gap-5 px-3 py-10">
        <div className="flex flex-col px-4">
          <span className="font-semibold text-xl pointer-events-none">
            Cao Dương Lâm
          </span>
          <span className="font-thin text-s pointer-events-none">Admin</span>
        </div>
        <div className="rounded-full p-2 h-[64px] w-[64px]">
          <input
            type="image"
            className="object-cover w-full h-full rounded-full"
            src={profileIcon}
            alt="Profile Image"
            onClick={() => setOpenProfile((prev) => !prev)}
          />
        </div>
        {openProfile && (
          <div className="absolute top-[4rem] right-[1.5rem] padding-[15px]">
            <UserProfileMenu />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
