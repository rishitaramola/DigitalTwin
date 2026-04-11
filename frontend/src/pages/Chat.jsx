import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, CornerDownLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── Topic MCQ definitions ────────────────────────────────────────────────────
const TOPIC_OPTIONS = [
  { id: 'productivity', emoji: '🎯', label: 'My Productivity', description: 'Focus, deep work & distractions' },
  { id: 'mood', emoji: '😊', label: 'My Mood & Energy', description: 'Stress, burnout & energy levels' },
  { id: 'habits', emoji: '🔁', label: 'My Habit DNA', description: 'Weekly patterns & best days' },
  { id: 'tonight', emoji: '🌙', label: "What I'll Do Tonight", description: 'Predict your evening behaviour' },
  { id: 'shadow', emoji: '👤', label: 'My Shadow Self', description: 'Focused vs distracted twin' },
  { id: 'help', emoji: '📌', label: 'Navigate Features', description: 'Learn what each section does' },
]

const FEATURE_GUIDE = {
  'Live Twin': 'The Dashboard — shows your real-time behavioural state, focus score, distraction risk, and triggers interventions.',
  'Run Simulation': 'What-if engine — choose "focus", "distraction", "walk", or "rest" and see your projected future state in 2 hours.',
  'Shadow Self': 'Compare your focused twin vs distracted twin side-by-side. See the gap in tasks, focus, and sleep quality.',
  'Habit DNA': 'Your weekly narrative report — identifies your best days, strongest focus windows, and hidden patterns.',
  'Success Archaeology': 'Mines your historical data to find the exact conditions that led to your most productive days.',
  'AI Clone Chat': 'You\'re already here! Chat with your digital twin to understand your habits and get predictions.',
}

// ── Contextual responses for each topic ─────────────────────────────────────
function getTopicResponse(topicId, username) {
  const name = username || 'you'
  const responses = {
    productivity: [
      `Here's what I see for ${name} 🎯\n\nYour peak focus window is typically **before 11 AM** and again **around 3 PM**. Historically, when you skip morning social apps, you get 2+ extra hours of deep work.\n\nRight now your distraction risk is moderate. Tip: close any news or social tabs before your next session!`,
      `Productivity snapshot for ${name} 📊\n\nYour best deep-work streaks happen at your **desk location** with **no notifications** in the first 90 minutes. Your behaviour chain shows you tend to drift after Email → News → Social.\n\nTry the **Run Simulation** tab to see what choosing "focus" does to your next 2 hours!`,
    ],
    mood: [
      `Mood & Energy reading for ${name} 😊\n\nYour stress proxy is currently elevated — this usually means shorter attention span and more app-switching. I detect a tiredness pattern.\n\n**My suggestion:** A 20-min break right now correlates with a **45% spike in your focus score** later. Don't push through — rest is data too.`,
      `Energy check for ${name} ⚡\n\nYour emotional state reading is "distracted" — this typically happens after 45+ mins of passive browsing. Your typing speed has dropped, which is another burnout signal.\n\nVisit the **Mood Fingerprint** card on your Dashboard for the full breakdown!`,
    ],
    habits: [
      `Your Habit DNA report for ${name} 🔁\n\nYour strongest focus happens on **Monday & Wednesday mornings**, desk location, no email before 10 AM. These are your "Super Days".\n\nYour biggest distraction pattern: you open Instagram within 8 mins of waking up 73% of days. Breaking this one habit unlocks ~90 mins of extra productive time.\n\nCheck the **Habit DNA** tab for the full weekly narrative!`,
      `Weekly habit pattern for ${name} 📅\n\nTop insight: a 10-min walk after study sessions leads to 2+ hours of deep work 78% of the time for you. That's your personal superpower!\n\nVisit **Success Archaeology** to mine your historically best days.`,
    ],
    tonight: [
      `Tonight's prediction for ${name} 🌙\n\nBased on your Friday behaviour patterns, there's an **82% chance** of doom-scrolling reels around 10:30 PM.\n\n**But** — if you put your phone in another room at 10 PM, you wake up fresh and can complete 2 study topics tomorrow morning. Small action, massive ripple effect.\n\nWant me to simulate the "rest" vs "distraction" outcome? Head to **Run Simulation**!`,
      `Evening forecast for ${name} 🔮\n\nYour data says: Tonight has a **high distraction risk** (score: 76%). You typically open YouTube or Instagram after dinner on this day of the week.\n\nAlternative path: 30 mins of light reading → better sleep quality (+1.2 score) → stronger focus tomorrow morning.`,
    ],
    shadow: [
      `Your Shadow Self breakdown for ${name} 👤\n\n**Focused Twin (if you choose focus now):**\n• +2.3 hours of deep work\n• 4 tasks completed\n• Sleep quality: 7.8/10\n\n**Distracted Twin (if you give in):**\n• 0.5 hours of deep work\n• 1 task completed\n• Sleep quality: 5.2/10\n\nThe gap is real. Visit the **Shadow Self** tab for the full side-by-side comparison!`,
    ],
    help: [
      `Here's a quick tour of your Digital Twin features, ${name}! 📌\n\n${Object.entries(FEATURE_GUIDE).map(([k, v]) => `**${k}** — ${v}`).join('\n\n')}`,
    ],
  }
  const options = responses[topicId] || []
  return options[Math.floor(Math.random() * options.length)] || "I'm analyzing your patterns. Try one of the options below!"
}

// ── Greeting responses ───────────────────────────────────────────────────────
const GREETINGS = ['hi', 'hello', 'hey', 'sup', 'hii', 'helo', 'hiya', 'good morning', 'good evening', 'good afternoon', 'namaste', 'yo']

function isGreeting(text) {
  return GREETINGS.some(g => text.toLowerCase().trim() === g || text.toLowerCase().trim().startsWith(g + ' ') || text.toLowerCase().trim().startsWith(g + '!'))
}

function getGreetingResponse(username) {
  const name = username || 'there'
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const greetings = [
    `${timeOfDay}, **${name}**! 👋 I'm your Digital Twin — a mirror of your habits and behaviours.\n\nWhat would you like to explore today? Pick a topic below and I'll give you a personalised insight!`,
    `Hey **${name}**! ✨ Great to see you. I've been tracking your patterns.\n\nSelect what you'd like to know and I'll pull up your data right away!`,
    `Hello **${name}**! 🤖 Your twin is online and ready.\n\nWhat are you curious about today — your focus, mood, habits, or tonight's prediction?`,
  ]
  return greetings[Math.floor(Math.random() * greetings.length)]
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Chat() {
  const { user } = useAuth()
  const username = user?.username || 'there'

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      type: 'greeting',
      text: `Hey **${username}**! 👋 I'm your Digital Twin — a mirror of your habits, moods and behavioural patterns.\n\nI can predict your focus, analyse your mood, decode your habits, and tell you what choices are available tonight.\n\nWhat would you like to explore?`,
      showTopics: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  // Send a plain text message
  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const lowerInput = userMsg.text.toLowerCase()
      let aiResponse = null

      if (isGreeting(userMsg.text)) {
        // Greeting → nice greeting + show topics
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: getGreetingResponse(username),
          showTopics: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      } else if (
        lowerInput.includes('feature') || lowerInput.includes('help') ||
        lowerInput.includes('what can') || lowerInput.includes('how do') ||
        lowerInput.includes('navigate') || lowerInput.includes('what do you do')
      ) {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: getTopicResponse('help', username),
          showTopics: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      } else if (lowerInput.includes('tonight') || lowerInput.includes('evening') || lowerInput.includes('night')) {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: getTopicResponse('tonight', username),
          showTopics: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      } else if (lowerInput.includes('tired') || lowerInput.includes('exhausted') || lowerInput.includes('mood') || lowerInput.includes('stress') || lowerInput.includes('energy')) {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: getTopicResponse('mood', username),
          showTopics: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      } else if (lowerInput.includes('focus') || lowerInput.includes('productiv') || lowerInput.includes('distract') || lowerInput.includes('work')) {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: getTopicResponse('productivity', username),
          showTopics: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      } else if (lowerInput.includes('habit') || lowerInput.includes('pattern') || lowerInput.includes('week')) {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: getTopicResponse('habits', username),
          showTopics: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      } else if (lowerInput.includes('shadow') || lowerInput.includes('twin') || lowerInput.includes('compare')) {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: getTopicResponse('shadow', username),
          showTopics: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      } else {
        // Unrecognised → ask what they want to know with MCQ
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Hmm, I'm not sure exactly what you mean, **${username}**! Let me help you navigate. What do you want to know about?`,
          showTopics: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      }

      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1200)
  }

  // MCQ topic click handler
  const handleTopicClick = (topicId) => {
    const selected = TOPIC_OPTIONS.find(t => t.id === topicId)
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: `${selected?.emoji} ${selected?.label}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: getTopicResponse(topicId, username),
        showTopics: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1000)
  }

  // Render message text with basic **bold** support
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.+?)\*\*/g)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} style={{ color: 'var(--violet-light)', fontWeight: 700 }}>{part}</strong> : part
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title flex items-center gap-12">
          AI Clone Chat <Sparkles size={24} color="var(--violet-light)" />
        </h1>
        <p className="page-subtitle">
          Hey <strong style={{ color: 'var(--violet-light)' }}>{username}</strong>! Talk to your data. Ask what your future holds.
        </p>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Chat window */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((msg) => (
            <div key={msg.id}>
              <div style={{ display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '12px' }}>
                {/* Avatar */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.sender === 'ai'
                    ? 'linear-gradient(135deg, var(--violet), var(--cyan))'
                    : 'rgba(124,58,237,0.2)',
                  boxShadow: msg.sender === 'ai' ? '0 4px 15px var(--violet-glow)' : 'none'
                }}>
                  {msg.sender === 'ai'
                    ? <Bot size={20} color="white" />
                    : <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--violet-light)' }}>
                        {username.slice(0, 2).toUpperCase()}
                      </span>
                  }
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '72%',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  borderBottomLeftRadius: msg.sender === 'ai' ? 0 : 'var(--radius-sm)',
                  borderBottomRightRadius: msg.sender === 'user' ? 0 : 'var(--radius-sm)',
                  background: msg.sender === 'user' ? 'rgba(124,58,237,0.15)' : 'var(--bg-elevated)',
                  border: `1px solid ${msg.sender === 'user' ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem', lineHeight: 1.65
                }}>
                  {renderText(msg.text)}
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.time}
                  </div>
                </div>
              </div>

              {/* MCQ topic buttons — show below AI messages */}
              {msg.sender === 'ai' && msg.showTopics && (
                <div style={{ paddingLeft: '48px', marginTop: '12px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em' }}>
                    WHAT DO YOU WANT TO KNOW?
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {TOPIC_OPTIONS.map(topic => (
                      <button
                        key={topic.id}
                        id={`topic-btn-${topic.id}`}
                        onClick={() => handleTopicClick(topic.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '7px 14px', borderRadius: '100px',
                          background: 'rgba(124,58,237,0.08)',
                          border: '1px solid rgba(124,58,237,0.25)',
                          color: 'var(--text-secondary)', cursor: 'pointer',
                          fontSize: '0.8rem', fontWeight: 600,
                          transition: 'all 0.18s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(124,58,237,0.2)'
                          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'
                          e.currentTarget.style.color = 'var(--violet-light)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(124,58,237,0.08)'
                          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'
                          e.currentTarget.style.color = 'var(--text-secondary)'
                        }}
                      >
                        {topic.emoji} {topic.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--violet), var(--cyan))' }}>
                <Bot size={20} color="white" />
              </div>
              <div style={{ background: 'var(--bg-elevated)', padding: '12px 18px', borderRadius: '12px', borderBottomLeftRadius: 0, color: 'var(--text-muted)', fontSize: '0.9rem', border: '1px solid var(--border)' }}>
                <span className="dot-anim">Analyzing your patterns...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Type anything, or pick a topic above, ${username}...`}
              style={{
                flex: 1, padding: '14px 20px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                color: 'white', outline: 'none', fontSize: '0.92rem'
              }}
            />
            <button
              id="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: '50px', height: '50px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--violet), #9d4edd)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                opacity: input.trim() ? 1 : 0.5, color: 'white',
                boxShadow: input.trim() ? '0 4px 16px var(--violet-glow)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Send size={20} style={{ marginLeft: '2px' }} />
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
            <CornerDownLeft size={11} style={{ display: 'inline', marginRight: '4px', opacity: 0.6 }} />
            Press Enter to send · Or click a topic button above
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
