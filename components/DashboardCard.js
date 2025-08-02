import React from "react";

export default function DashboardCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
  };

  const iconColors = {
    blue: "text-blue-500",
    green: "text-green-500",
    yellow: "text-yellow-500",
    red: "text-red-500",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {Icon && <Icon className={`h-6 w-6 ${iconColors[color]}`} />}
        </div>
      </div>
      <div className={`h-1 w-full ${colorClasses[color]}`}></div>
    </div>
  );
}
