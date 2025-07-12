import { useState, useEffect } from "react";
import { HiUserGroup } from "react-icons/hi2";
import { RiCalendarScheduleFill } from "react-icons/ri";
import Card from "../../../components/ui/Card";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const Layout = () => {
  const [currentDate, setCurrentDate] = useState("");

  // Data dummy untuk statistik
  const [totalUsers] = useState(24);
  const [totalMahasiswa] = useState(18);
  const [totalDosen] = useState(6);
  const [totalEventUpcoming] = useState(3);

  useEffect(() => {
    const formattedDate = format(new Date(), "EEE, dd MMM", { locale: id });
    setCurrentDate(formattedDate);
  }, []);

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm mb-3 font-medium dark:text-white">
          {currentDate}
        </p>
        <p className="md:text-2xl text-xl font-semibold dark:text-white">
          Hello, Oswald Tan!
        </p>
        <p className="md:text-2xl text-xl font-semibold bg-gradient-to-r from-purple-400 to-red-600 bg-clip-text text-transparent">
          Let’s get started on your tasks today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card
          title="Total Sekolah"
          count={totalUsers}
          icon={<HiUserGroup />}
          iconColor="text-blue-500"
          to="/users/admin"
        />
        <Card
          title="On Track"
          count={totalMahasiswa}
          icon={<HiUserGroup />}
          iconColor="text-teal-500"
          to="/users/all/mahasiswa"
        />
        <Card
          title="Warning"
          count={totalDosen}
          icon={<HiUserGroup />}
          iconColor="text-orange-500"
          to="/users/all/dosen"
        />
        <Card
          title="Delay"
          count={totalEventUpcoming}
          icon={<RiCalendarScheduleFill />}
          iconColor="text-purple-500"
          to="/events/list"
        />
      </div>
    </div>
  );
};

export default Layout;
