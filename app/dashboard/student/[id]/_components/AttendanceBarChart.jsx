import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AttendanceBarChart = ({ data }) => {
  return (
    /* Background ko transparent/dark blue kiya aur border ko dashboard jaisa banaya */
    <div className="bg-[#1a1f2e] p-4 rounded-2xl shadow-lg border border-gray-800 h-[350px] w-full transition-all hover:border-[#10B981]/50">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
        Monthly Attendance
      </h3>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          {/* Grid lines ko halka aur dash kiya taake text nazar aaye */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.4} />
          
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#9CA3AF', fontSize: 12}} 
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#9CA3AF', fontSize: 12}} 
          />
          
          <Tooltip 
            cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
            contentStyle={{ 
                backgroundColor: '#111827', 
                borderRadius: '12px', 
                border: '1px solid #374151', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                color: '#fff' 
            }}
            itemStyle={{ fontSize: '12px' }}
          />
          
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', color: '#9CA3AF' }}
          />
          
          {/* Animations aur Neon Colors apply kiye */}
          <Bar 
            dataKey="present" 
            fill="#10B981" 
            radius={[6, 6, 0, 0]} 
            name="Present Days" 
            animationDuration={1500}
            animationBegin={300}
            barSize={25}
          />
          
          <Bar 
            dataKey="total" 
            fill="#374151" 
            radius={[6, 6, 0, 0]} 
            name="Total Days" 
            animationDuration={2000}
            barSize={25}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceBarChart;