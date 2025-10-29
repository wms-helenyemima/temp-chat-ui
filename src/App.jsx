import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const renderJsonValue = (value, key = '') => {
    if (typeof value === 'string' && isValidUrl(value)) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:no-underline"
          style={{ color: 'rgb(66, 193, 227)' }}
        >
          Link
        </a>
      );
    }
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="ml-4 mt-1">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="mb-1">
              <span className="font-semibold">{k}: </span>
              {renderJsonValue(v, k)}
            </div>
          ))}
        </div>
      );
    }
    if (Array.isArray(value)) {
      return (
        <div className="ml-4 mt-1">
          {value.map((item, idx) => (
            <div key={idx} className="mb-1">
              <span className="font-semibold">[{idx}]: </span>
              {renderJsonValue(item)}
            </div>
          ))}
        </div>
      );
    }
    return <span>{String(value)}</span>;
  };

  const renderMessage = (text) => {
    try {
      const parsed = JSON.parse(text);
      return (
        <div className="space-y-2">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key}>
              <span className="font-semibold">{key}: </span>
              {renderJsonValue(value, key)}
            </div>
          ))}
        </div>
      );
    } catch {
      return <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('https://qctest---api-shooting-710933064092.asia-southeast2.run.app/whatsapp/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entry: [
            {
              changes: [
                {
                  value: {
                    messages: [
                      {
                        from: '628974324943',
                        text: {
                          body: userMessage
                        },
                        timestamp: Math.floor(Date.now() / 1000).toString()
                      }
                    ]
                  }
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.success && data.answer) {
        setMessages(prev => [...prev, { type: 'bot', text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { type: 'error', text: 'Failed to get response' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { type: 'error', text: 'Error: ' + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(to right, rgb(232, 101, 91), rgb(66, 193, 227))' }}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">syuting.film AI Assistant</h1>
              <p className="text-sm text-gray-500">Always here to help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(to bottom right, rgba(232, 101, 91, 0.2), rgba(66, 193, 227, 0.2))' }}>
                <Bot className="w-10 h-10" style={{ color: 'rgb(232, 101, 91)' }} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to syuting.film AI</h2>
            </div>
          )}
          
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={msg.type === 'user' 
                    ? { background: 'linear-gradient(to right, rgb(232, 101, 91), rgb(66, 193, 227))' }
                    : { background: 'linear-gradient(to bottom right, #e5e7eb, #d1d5db)' }
                  }
                >
                  {msg.type === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-gray-700" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex-1 max-w-2xl ${msg.type === 'user' ? 'flex justify-end' : ''}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'text-white'
                        : msg.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                    }`}
                    style={msg.type === 'user' ? { background: 'linear-gradient(to right, rgb(232, 101, 91), rgb(66, 193, 227))' } : {}}
                  >
                    {msg.type === 'bot' ? renderMessage(msg.text) : <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3">
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(to bottom right, #e5e7eb, #d1d5db)' }}
                >
                  <Bot className="w-5 h-5 text-gray-700" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'rgb(232, 101, 91)' }} />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 resize-none"
                style={{ 
                  minHeight: '48px', 
                  maxHeight: '120px',
                  boxShadow: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgb(232, 101, 91)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(232, 101, 91, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 w-12 h-12 text-white rounded-xl disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
              style={{ 
                background: (loading || !input.trim()) 
                  ? 'linear-gradient(to bottom right, #d1d5db, #9ca3af)' 
                  : 'linear-gradient(to right, rgb(232, 101, 91), rgb(66, 193, 227))'
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.background = 'linear-gradient(to right, rgb(220, 85, 75), rgb(50, 180, 215))';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.background = 'linear-gradient(to right, rgb(232, 101, 91), rgb(66, 193, 227))';
                }
              }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}