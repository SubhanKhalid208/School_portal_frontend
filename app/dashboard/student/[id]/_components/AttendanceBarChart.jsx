import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const AttendanceBarChart = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[350px] w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Attendance</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{fontSize: 12}} />
          <YAxis tick={{fontSize: 12}} />
          <Tooltip 
             cursor={{fill: '#f3f4f6'}}
             contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Bar dataKey="present" fill="#10B981" radius={[4, 4, 0, 0]} name="Present Days" />
          <Bar dataKey="total" fill="#D1D5DB" radius={[4, 4, 0, 0]} name="Total Working Days" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceBarChart;