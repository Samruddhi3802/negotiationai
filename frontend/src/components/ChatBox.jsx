import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { 
    Swords, 
    Handshake, 
    LogOut, 
    ArrowUp, 
    MessageSquare, 
    Briefcase,
    Loader
} from "lucide-react";
import "./ChatBox.css";

export default function ChatBox({ setLastData, mode, persona, prepData, priceHistory, setPriceHistory, onConclude }) {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentTone, setCurrentTone] = useState(null);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat]);

    useEffect(() => {
        setChat([]);
    }, [mode]);

    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        const userMsg = message;
        setMessage("");
        setLoading(true);

        setChat(prev => [...prev, { user: userMsg, ai: null }]);

        try {
            const res = await API.post("/chat", {
                input: userMsg,
                mode: mode,
                persona: persona
            });

            const aiReply = res.data.reply;
            setLastData(res.data);
            setCurrentTone(res.data.tone);

            setChat(prev => {
                const newChat = [...prev];
                newChat[newChat.length - 1].ai = aiReply;
                return newChat;
            });

            if (mode === "dojo") {
                const userPrice = res.data.extracted_user_price;
                const aiPrice = res.data.extracted_ai_price;
                if (userPrice !== null || aiPrice !== null) {
                    setPriceHistory(prev => {
                        const turnNum = prev.length + 1;
                        const prevUser = prev.length > 0 ? prev[prev.length - 1].userPrice : null;
                        const prevAi = prev.length > 0 ? prev[prev.length - 1].aiPrice : null;
                        return [
                            ...prev,
                            {
                                turn: `Turn ${turnNum}`,
                                userPrice: userPrice !== null ? userPrice : prevUser,
                                aiPrice: aiPrice !== null ? aiPrice : prevAi
                            }
                        ];
                    });
                }
            }

        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            {/* Control Bar for Dojo Session */}
            {mode === "dojo" && (
                <div className="chat-control-bar">
                    <div className="live-status">
                        <span className="status-dot pulsing"></span>
                        <Swords size={14} className="live-icon text-primary" style={{ marginRight: '6px' }} />
                        <span className="status-lbl">Live Dojo Session</span>
                        {currentTone && (
                            <div className="eq-meter-mini" title="Your Current Emotional Intelligence Tone">
                                <span className="eq-label">EQ Tone:</span>
                                <span className={`eq-value tone-${currentTone.toLowerCase()}`}>{currentTone}</span>
                            </div>
                        )}
                    </div>
                    <div className="control-actions">
                        <button 
                            className="control-btn conclude-btn" 
                            onClick={() => onConclude(chat)} 
                            disabled={loading || chat.length === 0}
                            title="Wrap up terms and sign the deal"
                        >
                            <Handshake size={14} />
                            <span>Conclude Deal</span>
                        </button>
                        <button 
                            className="control-btn walk-btn" 
                            onClick={() => onConclude(chat)} 
                            disabled={loading || chat.length === 0}
                            title="Reject offers and walk away to BATNA"
                        >
                            <LogOut size={14} />
                            <span>Walk Away</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="chat-messages">
                {chat.length === 0 && (
                    <div className="chat-empty-state">
                        <div className="empty-icon">
                            {mode === 'dojo' ? <Swords size={40} /> : <Briefcase size={40} />}
                        </div>
                        <h3>Ready to negotiate?</h3>
                        <p>
                            {mode === 'dojo' 
                                ? "The AI is waiting as a tough buyer. Send your first pitch to start the session."
                                : "Define what you need to buy and the AI will handle the procurement logic."}
                        </p>
                    </div>
                )}
                {chat.map((c, i) => (
                    <div key={i} className="message-group">
                        <div className="message user">
                            <div className="bubble">{c.user}</div>
                        </div>
                        {c.ai && (
                            <div className="message ai">
                                <div className="bubble">
                                    {c.ai}
                                </div>
                            </div>
                        )}
                        {!c.ai && loading && i === chat.length - 1 && (
                            <div className="message ai">
                                <div className="bubble loading-bubble">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
                <div className="input-wrapper">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Type your negotiation message..."
                        className="chat-input"
                        disabled={loading}
                        rows="1"
                    />
                    <button 
                        onClick={sendMessage} 
                        className={`send-btn ${loading ? 'loading' : ''} ${message.trim() ? 'active' : ''}`}
                        disabled={loading || !message.trim()}
                    >
                        {loading ? (
                            <Loader size={16} className="spinner" />
                        ) : (
                            <ArrowUp size={16} />
                        )}
                    </button>
                </div>
                <p className="input-footer">
                    DealCraft AI can provide strategic insights. Always verify critical terms.
                </p>
            </div>
        </div>
    );
}