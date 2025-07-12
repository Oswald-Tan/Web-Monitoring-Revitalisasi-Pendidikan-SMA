import { useState } from "react";
import mockData from "../../data/mockData";
import { UserPlus, Check, XCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import { RiApps2AddFill } from "react-icons/ri";

const HakAkses = () => {
  const [newUser, setNewUser] = useState({ email: "", role: "Fasilitator" });

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">Hak Akses</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex gap-2">
            <Button
              text="Tambah User"
              to="/users/add/dosen"
              iconPosition="left"
              icon={<RiApps2AddFill />}
              width={"min-w-[120px] "}
              className={"bg-purple-500 hover:bg-purple-600"}
            />
          </div>
          <input
            type="text"
            name="email"
            value={newUser.email}
            onChange={handleNewUserChange}
            placeholder="Email user baru"
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none"
          />
          <select
            name="role"
            value={newUser.role}
            onChange={handleNewUserChange}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none"
          >
            <option value="Fasilitator">Fasilitator</option>
            <option value="Koordinator">Koordinator</option>
            <option value="Admin Sekolah">Admin Sekolah</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockData.users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select className="border border-gray-300 rounded-lg px-2 py-1">
                      <option selected={user.role === "Super Admin"}>
                        Super Admin
                      </option>
                      <option selected={user.role === "Koordinator"}>
                        Koordinator
                      </option>
                      <option selected={user.role === "Fasilitator"}>
                        Fasilitator
                      </option>
                      <option selected={user.role === "Admin Sekolah"}>
                        Admin Sekolah
                      </option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      <span>Aktif</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      <span>Nonaktifkan</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HakAkses;
