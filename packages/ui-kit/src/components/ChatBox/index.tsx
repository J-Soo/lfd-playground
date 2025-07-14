import { useState, useRef, useEffect } from 'react'

export interface Message {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: Date
  type?: 'message' | 'system'
}

export interface ChatBoxProps {
  messages: Message[]
  currentUserId: string
  onSendMessage: (text: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ChatBox({ 
  messages, 
  currentUserId, 
  onSendMessage, 
  placeholder = "Type a message...",
  disabled = false 
}: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`${
              message.type === 'system' 
                ? 'text-center text-sm text-gray-500 italic' 
                : message.userId === currentUserId 
                  ? 'text-right' 
                  : 'text-left'
            }`}
          >
            {message.type !== 'system' && (
              <div className={`inline-block max-w-[70%] ${
                message.userId === currentUserId 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100'
              } rounded-lg px-3 py-2`}>
                {message.userId !== currentUserId && (
                  <div className="text-xs font-medium mb-1 opacity-70">
                    {message.userName}
                  </div>
                )}
                <div className="text-sm">{message.text}</div>
              </div>
            )}
            {message.type === 'system' && (
              <div>{message.text}</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={disabled || !inputValue.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatBox