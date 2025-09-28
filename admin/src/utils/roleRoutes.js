export const roleRoutes = {
  super_admin: "/super-admin/dashboard",
  admin_pusat: "/admin-pusat/dashboard",
  admin_sekolah: "/admin-sekolah/dashboard",
  koordinator: "/koordinator/dashboard",
  fasilitator: "/fasilitator/dashboard",
};

export const getDashboardPathByRole = (role) => roleRoutes[role] || "/";
