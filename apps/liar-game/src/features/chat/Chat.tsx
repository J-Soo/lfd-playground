import { useState } from 'react'

export default function Chat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<string[]>([])

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, message])
      setMessage('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-3">Chat</h3>
      
      <div className="flex-1 overflow-y-auto mb-4 p-3 bg-gray-50 rounded">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages yet...</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="mb-2">
              <p className="text-sm">{msg}</p>
            </div>
          ))
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  )
}