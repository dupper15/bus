import background from "../../assets/Group 69.png";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();
  return (
    <div
      className="h-screen bg-cover bg-center flex flex-col items-center justify-center gap-8"
      style={{ backgroundImage: `url(${background})` }}>
      <div className="text-[#4CAF50] font-bold text-5xl">BusMap</div>
      <div className="text-white font-bold text-6xl">
        Transportation made simple
      </div>
      <div className="text-white font-light text-3xl">
        Explore new destinations and create unforgettable memories.
      </div>
      <button
        onClick={() => {
          navigate("/login");
        }}
        className="bg-[#4CAF50] hover:bg-[#8ce58f] text-white font-bold py-2 px-6 rounded-md">
        Get started
      </button>
    </div>
  );
};

export default WelcomePage;
