import MySchoolProgress from '../../../components/MySchoolProgress';

const Layout = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="text-sm text-gray-500">
          Data diperbarui: {new Date().toLocaleDateString('id-ID')}
        </div>
      </div>

      {/* Progress Chart */}
      <MySchoolProgress />
    </div>
  );
};

export default Layout;