import { useState } from "react"
import { useLocation } from "react-router-dom"
import { MessageSquare, X, Send, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

export function Chatbot() {
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)

    // Only show on non-dashboard pages
    if (location.pathname === "/dashboard") return null

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        const token = localStorage.getItem("token")

        try {
            const res = await fetch("http://localhost:8000/api/v1/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ message: userMsg })
            })

            if (res.ok) {
                const data = await res.json()
                setMessages(prev => [...prev, { role: 'ai', content: data.reply }])
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting right now.' }])
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Connection error.' }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-8 w-80 sm:w-96 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col z-50 transition-all font-sans">
                    <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
                        <h3 className="font-bold text-sm">Nutrition Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto max-h-80 bg-secondary/10 flex flex-col gap-3">
                        {messages.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center my-4 opacity-80 italic">Ask me anything about food, calories, and nutrition!</p>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-background border border-border rounded-tl-sm text-foreground chatbot-markdown'}`}>
                                    {msg.role === 'ai' ? (
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-background border border-border rounded-xl rounded-tl-sm p-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                </div>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSend} className="p-3 bg-background border-t border-border flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-secondary/50 border border-border rounded-full px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Ask a nutrition question..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={loading || !input.trim()} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 shrink-0">
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40"
                    title="Chat with Nutrition Assistant"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            )}
        </>
    )
}
