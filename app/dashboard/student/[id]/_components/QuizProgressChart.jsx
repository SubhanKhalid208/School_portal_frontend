import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const QuizProgressChart = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[350px] w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Quiz Performance Trend</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="subject" tick={{fontSize: 12}} interval={0} />
          <YAxis domain={[0, 100]} tick={{fontSize: 12}} />
          <Tooltip 
            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="percentage" 
            stroke="#4F46E5" 
            strokeWidth={3} 
            dot={{ r: 6, fill: '#4F46E5' }} 
            activeDot={{ r: 8 }}
            name="Score (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuizProgressChart;