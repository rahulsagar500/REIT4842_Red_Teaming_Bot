import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { fetchWithCSRF } from '../utils/csrfLoader';

ChartJS.register(ArcElement, Tooltip, Legend);

type Chatbot = {
  id: string;
  name: string;
  status: 'active' | 'trained' | 'inactive';
  created_at: string;
};

const Overview = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithCSRF('/chatbots')
      .then((res) => res.json())
      .then(setChatbots)
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = chatbots.reduce(
    (acc, cb) => {
      acc[cb.status] += 1;
      return acc;
    },
    { active: 0, trained: 0, inactive: 0 }
  );

  const pieData = {
    labels: ['Active', 'Trained', 'Inactive'],
    datasets: [
      {
        label: 'Chatbot Status',
        data: [statusCounts.active, statusCounts.trained, statusCounts.inactive],
        backgroundColor: ['#10b981', '#3b82f6', '#f87171'],
        borderWidth: 1,
      },
    ],
  };

  if (loading) return <div className="p-4">Loading chatbot overview...</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Chatbot Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border shadow rounded">
          <h3 className="font-semibold text-lg">Total Chatbots</h3>
          <p className="text-3xl">{chatbots.length}</p>
        </div>
        <div className="p-4 bg-white border shadow rounded">
          <h3 className="font-semibold text-lg">Active</h3>
          <p className="text-3xl text-green-600">{statusCounts.active}</p>
        </div>
        <div className="p-4 bg-white border shadow rounded">
          <h3 className="font-semibold text-lg">Trained (Not Deployed)</h3>
          <p className="text-3xl text-blue-600">{statusCounts.trained}</p>
        </div>
      </div>

      <div className="p-4 bg-white border shadow rounded max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-center">Status Distribution</h3>
        <Pie data={pieData} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Recent Chatbots</h2>
        <ul className="space-y-1">
          {chatbots.slice(0, 5).map((cb) => (
            <li key={cb.id} className="border p-2 rounded shadow-sm">
              <strong>{cb.name}</strong> — <span className="capitalize">{cb.status}</span> —{' '}
              {new Date(cb.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Overview;
