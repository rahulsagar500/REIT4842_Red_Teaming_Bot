import React, { useEffect, useState } from 'react';
import { fetchWithCSRF } from '../utils/csrfLoader';

type Chatbot = {
  id: string;
  name: string;
  description: string;
  deployment_url: string;
  created_at: string;
  last_trained_at: string;
  status: string;
};

const Chatbots = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWithCSRF('/chatbots')
      .then((res) => res.json())
      .then(setChatbots)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleTrain = (id: string) => {
    fetchWithCSRF(`/chatbots/${id}/train`, {
      method: 'POST',
    })
      .then(() => alert(`Chatbot ${id} sent to humpi (train)`))
      .catch((err) => alert(`Train failed: ${err.message}`));
  };

  const handleDeploy = (id: string) => {
    fetchWithCSRF(`/chatbots/${id}/deploy`, {
      method: 'POST',
    })
      .then(() => alert(`Chatbot ${id} sent to humpa (deploy)`))
      .catch((err) => alert(`Deploy failed: ${err.message}`));
  };

  if (loading) return <div className="p-4">Loading chatbots...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Chatbots</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Created</th>
            <th className="border p-2">Last Trained</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chatbots.map((cb) => (
            <tr key={cb.id}>
              <td className="border p-2">{cb.name}</td>
              <td className="border p-2">{cb.description}</td>
              <td className="border p-2">{new Date(cb.created_at).toLocaleString()}</td>
              <td className="border p-2">{new Date(cb.last_trained_at).toLocaleString()}</td>
              <td className="border p-2 capitalize">{cb.status}</td>
              <td className="border p-2 space-x-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => handleTrain(cb.id)}
                >
                  Humpi
                </button>
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded"
                  onClick={() => handleDeploy(cb.id)}
                >
                  Humpa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Chatbots;
