import React, { useState, useEffect } from 'react';
import { fetchWithCSRF } from '../utils/csrfLoader';

type Testset = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

const NewChatbot: React.FC = () => {
  const [testsets, setTestsets] = useState<Testset[]>([]);
  const [selectedTestset, setSelectedTestset] = useState<string>('');
  const [chatbotName, setChatbotName] = useState('');
  const [status, setStatus] = useState<'idle' | 'creating' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchWithCSRF('http://localhost:5000/api/testsets')
      .then((res) => res.json())
      .then(setTestsets)
      .catch((err) => {
        console.error('Failed to load testsets:', err);
        setMessage('❌ Failed to load testsets');
        setStatus('error');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTestset || !chatbotName.trim()) {
      setMessage('Please select a testset and provide a chatbot name.');
      setStatus('error');
      return;
    }

    try {
      setStatus('creating');
      setMessage(null);

      const res = await fetchWithCSRF('http://localhost:5000/chatbots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_id: selectedTestset,
          name: chatbotName,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setStatus('success');
      setMessage(`✅ Chatbot created! ID: ${data.chatbot_id}`);
      setChatbotName('');
      setSelectedTestset('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🧠 Create a New Chatbot</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Chatbot Name</label>
          <input
            className="w-full p-2 border rounded"
            type="text"
            placeholder="Enter chatbot name"
            value={chatbotName}
            onChange={(e) => setChatbotName(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Select Testset</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedTestset}
            onChange={(e) => setSelectedTestset(e.target.value)}
          >
            <option value="">-- Choose a testset --</option>
            {testsets.map((ts) => (
              <option key={ts.id} value={ts.id}>
                {ts.name} ({new Date(ts.created_at).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={status === 'creating'}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {status === 'creating' ? 'Creating...' : 'Create Chatbot'}
        </button>

        {message && (
          <p className={`mt-2 ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default NewChatbot;
