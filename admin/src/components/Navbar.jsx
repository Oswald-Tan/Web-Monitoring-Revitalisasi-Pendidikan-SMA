import { HiMenuAlt2 } from "react-icons/hi";
import { useSidebar } from "../context/useSidebar";
import { AiOutlineUser } from "react-icons/ai";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { toggleSidebar } = useSidebar();

  return (
    <div className="relative flex items-center justify-between h-[56px] px-4 bg-white border-b border-white">
      {/* Toggle Sidebar */}
      <button
        className="cursor-pointer text-[#0e0e0e]"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <HiMenuAlt2 size={26} />
      </button>

      {/* Profile */}
      <div className="relative">
        <div className="flex items-center gap-3">
          {/* Profile Button */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="border border-gray-500 rounded-full p-1">
                <AiOutlineUser
                  size={20}
                  className="text-gray-500"
                />
              </div>
              <p className="text-sm text-gray-500 sm:block hidden">
                {user && user.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;