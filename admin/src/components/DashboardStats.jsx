import React from "react";
import { School, CheckCircle2, AlertTriangle, Clock, Award } from "lucide-react";

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Schools */}
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Total Sekolah
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalSchools}
            </p>
          </div>

          <div className="rounded-full bg-blue-100 p-3">
            <School className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* On Track Schools */}
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-800">
              On Track
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.onTrackSchools}
            </p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Completed Schools */}
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Completed
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats.completedSchools}
            </p>
          </div>
          <div className="rounded-full bg-purple-100 p-3">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Delayed Schools */}
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Delayed
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {stats.delayedSchools}
            </p>
          </div>
          <div className="rounded-full bg-red-100 p-3">
            <Clock className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;