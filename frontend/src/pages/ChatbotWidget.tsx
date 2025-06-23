// `src/pages/ChatWidget.tsx`
import { useParams } from 'react-router-dom';

const ChatWidget = () => {
  const { chatbotId } = useParams<{ chatbotId: string }>();

  return (
    <div className="h-screen w-full p-4 bg-gray-50">
      <div className="max-w-md mx-auto h-full border rounded shadow bg-white p-4">
        <h2 className="text-lg font-semibold mb-2">Chatbot Widget: {chatbotId}</h2>
        {/* TODO: Replace this with actual chatbot logic */}
        <div className="border p-2 rounded h-[80%] overflow-y-auto">
          <p>🤖 Hello! This is chatbot <code>{chatbotId}</code>.</p>
        </div>
        <input className="w-full mt-2 border p-2 rounded" placeholder="Type a message..." />
      </div>
    </div>
  );
};

export default ChatWidget;
