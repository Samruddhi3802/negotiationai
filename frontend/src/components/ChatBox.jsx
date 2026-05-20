import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import "./ChatBox.css";

export default function ChatBox({ setLastData, mode, persona }) {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat]);

    useEffect(() => {
        // Clear chat when mode changes
        setChat([]);
    }, [mode]);

    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        const userMsg = message;
        setMessage("");
        setLoading(true);

        // Add user message to chat immediately
        setChat(prev => [...prev, { user: userMsg, ai: null }]);

        try {
            const res = await API.post("/chat", {
                input: userMsg,
                mode: mode,
                persona: persona
            });

            const aiReply = res.data.reply;
            setLastData(res.data);

            // Update the last chat item with AI response
            setChat(prev => {
                const newChat = [...prev];
                newChat[newChat.length - 1].ai = aiReply;
                return newChat;
            });

        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {chat.length === 0 && (
                    <div className="chat-empty-state">
                        <div className="empty-icon">{mode === 'dojo' ? '🥊' : '🤝'}</div>
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
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your negotiation message..."
                    className="chat-input"
                    disabled={loading}
                />
                <button 
                    onClick={sendMessage} 
                    className={`send-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? "..." : "Send"}
                </button>
            </div>
        </div>
    );
}