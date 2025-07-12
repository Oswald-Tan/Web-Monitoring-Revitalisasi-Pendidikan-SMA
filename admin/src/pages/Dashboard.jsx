import mockData from '../data/mockData';
import StatCard from '../components/StatCard';
import ProgressChart from '../components/ProgressChart';
import ActivityNotification from '../components/ActivityNotification';
import { 
  School, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
} from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold  dark:text-white">Dashboard</h2>
        <div className="text-sm text-gray-500">
          Data diperbarui: {new Date().toLocaleDateString('id-ID')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Sekolah" 
          value={mockData.stats.totalSchools} 
          icon={<School />} 
          color="blue"
        />
        
        <StatCard 
          title="On Track" 
          value={mockData.stats.onTrack} 
          icon={<CheckCircle />} 
          color="green"
        />
        
        <StatCard 
          title="Warning" 
          value={mockData.stats.warning} 
          icon={<AlertTriangle />} 
          color="yellow"
        />
        
        <StatCard 
          title="Delay" 
          value={mockData.stats.delay} 
          icon={<Clock />} 
          color="red"
        />
      </div>

      {/* Progress Chart */}
      <ProgressChart />

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Notifikasi Terbaru</h3>
        <div className="space-y-3">
          <ActivityNotification 
            title="Progress SMA Negeri 2 Tomohon menurun" 
            description="Progress turun 5% dari target mingguan" 
            type="warning"
          />
          
          <ActivityNotification 
            title="SMA Negeri 1 Gorontalo mencapai 92%" 
            description="Target bulanan tercapai lebih awal" 
            type="success"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;