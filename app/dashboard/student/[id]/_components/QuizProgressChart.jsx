import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

const QuizProgressChart = ({ data }) => {
  return (
    /* Background matches your dashboard's dark blue/navy theme */
    <div className="bg-[#1a1f2e] p-4 rounded-2xl shadow-lg border border-gray-800 h-[350px] w-full transition-all hover:border-[#6366f1]/50">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-[#6366f1] rounded-full animate-pulse"></span>
        Quiz Performance Trend
      </h3>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          {/* Subtle grid lines for a cleaner look */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
          
          <XAxis 
            dataKey="subject" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#9CA3AF', fontSize: 11}} 
            interval={0}
          />
          
          <YAxis 
            domain={[0, 100]} 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#9CA3AF', fontSize: 11}} 
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#111827', 
              borderRadius: '12px', 
              border: '1px solid #374151', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              color: '#fff' 
            }}
            itemStyle={{ color: '#6366f1', fontSize: '12px', fontWeight: 'bold' }}
          />
          
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="diamond"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', color: '#9CA3AF' }}
          />
          
          {/* Main Performance Line with Neon Glow Effect */}
          <Line 
            type="monotone" 
            dataKey="percentage" 
            stroke="#6366f1" 
            strokeWidth={4} 
            dot={{ r: 6, fill: '#1a1f2e', stroke: '#6366f1', strokeWidth: 3 }} 
            activeDot={{ r: 8, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
            name="Score (%)"
            animationDuration={2000}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuizProgressChart;