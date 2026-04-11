import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hey Rishita, I'm your Digital Twin. I've been analyzing your habits. What do you want to know about your future?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate Generative AI logic locally based on keywords
    setTimeout(() => {
      const lowerInput = userMsg.text.toLowerCase()
      let replyText = "I'm analyzing your historical patterns... Based on your data, making a small adjustment here will save you hours later."
      
      if (lowerInput.includes('tonight') || lowerInput.includes('what will i do')) {
        replyText = "Based on your habits on Friday nights, you have an 82% chance of doom-scrolling reels around 10:30 PM. But if you put your phone in another room at 10:00 PM, you can wake up fresh and complete 2 study topics tomorrow morning."
      } else if (lowerInput.includes('tired') || lowerInput.includes('exhausted')) {
        replyText = "I detect burnout risk. My suggestion: Don't push through. A 20-minute nap right now correlates with a 45% spike in your focus score later. Can I start a rest timer for you?"
      } else if (lowerInput.includes('tomorrow')) {
        replyText = "Tomorrow looks like a 'Super Day' if you start right. Your strongest focus happens when you avoid email before 10 AM. Let me block those notifications for you."
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title flex items-center gap-12">
          AI Clone Chat <Sparkles size={24} color="var(--violet-light)" />
        </h1>
        <p className="page-subtitle">Talk to your data. Ask what your future holds.</p>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Chat window */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '12px' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: msg.sender === 'ai' ? 'linear-gradient(135deg, var(--violet), var(--cyan))' : 'rgba(255,255,255,0.1)',
                boxShadow: msg.sender === 'ai' ? '0 4px 15px var(--violet-glow)' : 'none'
              }}>
                {msg.sender === 'ai' ? <Bot size={20} color="white" /> : <User size={20} color="var(--text-secondary)" />}
              </div>
              <div style={{ 
                maxWidth: '70%', 
                padding: '14px 18px', 
                borderRadius: 'var(--radius-sm)',
                borderBottomLeftRadius: msg.sender === 'ai' ? 0 : 'var(--radius-sm)',
                borderBottomRightRadius: msg.sender === 'user' ? 0 : 'var(--radius-sm)',
                background: msg.sender === 'user' ? 'rgba(124,58,237,0.15)' : 'var(--bg-elevated)',
                border: `1px solid ${msg.sender === 'user' ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                color: 'var(--text-primary)',
                fontSize: '0.95rem', lineHeight: 1.6
              }}>
                {msg.text}
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--violet), var(--cyan))' }}>
                <Bot size={20} color="white" />
              </div>
              <div style={{ background: 'var(--bg-elevated)', padding: '12px 18px', borderRadius: '12px', borderBottomLeftRadius: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span className="dot-anim">Predicting...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="e.g., What will I do tonight? Or I feel tired..."
              style={{
                flex: 1, padding: '14px 20px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                color: 'white', outline: 'none', fontSize: '0.95rem'
              }}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: '50px', height: '50px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--violet), #9d4edd)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                opacity: input.trim() ? 1 : 0.5, color: 'white'
              }}
            >
              <Send size={20} style={{ marginLeft: '2px' }} />
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
            Powered by Generative AI (Local LLM simulation)
          </div>
        </div>
      </div>
      <style>{`
        @keyframes typing { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
        .dot-anim { animation: typing 1.4s infinite; }
      `}</style>
    </div>
  )
}
