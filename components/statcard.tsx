import {ReactNode} from "react";

interface StatCardProps {
    title:string;
    value:ReactNode;
    icon:ReactNode;
    bgColor?: string;
}

export function StatCard({ title, value, icon,bgColor = "bg-blue-50" }: StatCardProps) {
  return (
    <div className="border border-gray-300 rounded-xl bg-white flex items-center justify-between p-5">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-lg text-black ">{value}</p>
      </div>

         <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl ${bgColor}`}
      >
        {icon}
      </div>
    </div>
  );
}