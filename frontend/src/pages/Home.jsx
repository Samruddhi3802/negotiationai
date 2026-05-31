import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatBox from "../components/ChatBox";
import Dashboard from "../components/Dashboard";
import PrepPlanner from "../components/PrepPlanner";
import Sidebar from "../components/Sidebar";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const personas = [
    { id: "skeptical", label: "Skeptical Anna", icon: "🧐", desc: "Detailed & logical" },
    { id: "aggressive", label: "Tough Tom", icon: "🥷", desc: "Demands heavy discounts" },
    { id: "collaborative", label: "Friendly Fred", icon: "🤝", desc: "Seeks a win-win compromise" }
];

const negotiationTips = [
    "💡 Tip: Anchor first! The first offer sets the baseline for the entire negotiation.",
    "💡 Tip: Leverage Silence. After presenting a price, stay quiet and let the buyer speak first.",
    "💡 Tip: Focus on value, not price. Explain what they gain rather than what they pay.",
    "💡 Tip: Always get a concession in return. If you lower your price, ask for a longer contract term.",
    "💡 Tip: Identify their constraints. Ask open questions to understand their actual budget blockages."
];

export default function Home() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [lastData, setLastData] = useState(null);
    const [mode, setMode] = useState("dojo");
    const [persona, setPersona] = useState("skeptical");
    const [resetKey, setResetKey] = useState(0);
    const [activeTip, setActiveTip] = useState("");
    const [theme, setTheme] = useState("dark");

    // Prep Planner and Conclude States
    const [prepFinished, setPrepFinished] = useState(false);
    const [prepData, setPrepData] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [concluding, setConcluding] = useState(false);
    const [concludedReview, setConcludedReview] = useState(null);

    // Set a random tip on mount or when session resets
    useEffect(() => {
        const randomTip = negotiationTips[Math.floor(Math.random() * negotiationTips.length)];
        setActiveTip(randomTip);
    }, [resetKey, mode]);

    const handleReset = () => {
        setLastData(null);
        setPrepFinished(false);
        setPrepData(null);
        setPriceHistory([]);
        setConcluding(false);
        setConcludedReview(null);
        setResetKey(prev => prev + 1);
    };

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        if (nextTheme === "light") {
            document.documentElement.classList.add("light");
        } else {
            document.documentElement.classList.remove("light");
        }
    };

    const handleConclude = async (chatHistory) => {
        if (chatHistory.length === 0) return;
        setConcluding(true);
        try {
            const formattedHistory = chatHistory.map(item => ({
                user: item.user,
                ai: item.ai || ""
            }));

            const res = await API.post(`/conclude?mode=${mode}&persona=${persona}`, {
                chat_history: formattedHistory,
                prep_data: {
                    target_price: prepData.targetPrice,
                    walk_away_price: prepData.walkAwayPrice,
                    buyer_min: prepData.buyerMin,
                    buyer_max: prepData.buyerMax,
                    alternatives: prepData.alternatives.map(alt => ({
                        name: alt.name,
                        cost: alt.cost,
                        probability: alt.probability,
                        switching_cost: alt.switchingCost
                    }))
                }
            });
            setConcludedReview(res.data);
        } catch (error) {
            console.error("Error concluding session:", error);
        } finally {
            setConcluding(false);
        }
    };

    const renderPostNegotiationReport = () => {
        if (!concludedReview) return null;
        const { agreement_reached, final_price, value_claimed_pct, tactics_spotted, concession_pattern, feedback } = concludedReview;
        const valueColor = value_claimed_pct >= 70 ? '#00e5ff' : (value_claimed_pct >= 40 ? '#ffb300' : '#ff3d00');

        return (
            <div className="post-review-dashboard glass-panel">
                <div className="review-header">
                    <span className="review-tag">Session Completed</span>
                    <h2>📊 Performance Audit Report</h2>
                    <p>Below is your complete tactical audit and mathematical concession report.</p>
                </div>

                <div className="review-metrics-row">
                    <div className="metric-box card-dark">
                        <span className="label">Agreement Status</span>
                        <span className={`value ${agreement_reached ? 'text-green' : 'text-red'}`}>
                            {agreement_reached ? "Agreement Reached" : "Walked Away"}
                        </span>
                    </div>
                    {agreement_reached && final_price !== null && (
                        <div className="metric-box card-dark">
                            <span className="label">Final Agreed Price</span>
                            <span className="value text-cyan">₹{final_price.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="metric-box card-dark">
                        <span className="label">Value Claimed Index</span>
                        <span className="value" style={{ color: valueColor }}>{value_claimed_pct}%</span>
                        <span className="sub-label">Of Zone of Possible Agreement</span>
                    </div>
                </div>

                <div className="review-grid">
                    <div className="review-section card-dark">
                        <h3>📈 Concession Pattern Analysis</h3>
                        <p className="concession-text">{concession_pattern}</p>
                    </div>
                    
                    <div className="review-section card-dark">
                        <h3>💡 AI Coach Debrief</h3>
                        <p className="feedback-text">{feedback}</p>
                    </div>
                </div>

                <div className="review-section tactics-section card-dark">
                    <h3>🥷 Tactics Spotted Audit</h3>
                    <div className="tactics-list">
                        {tactics_spotted && tactics_spotted.length > 0 ? (
                            tactics_spotted.map((t, i) => (
                                <div key={i} className="tactic-audit-card">
                                    <div className="tactic-audit-header">
                                        <span className="tactic-badge">{t.tactic}</span>
                                        <span className="tactic-turn">Turn {t.turn}</span>
                                    </div>
                                    <blockquote className="tactic-quote">"{t.quote}"</blockquote>
                                    <p className="tactic-impact">✨ {t.impact}</p>
                                </div>
                            ))
                        ) : (
                            <div className="empty-tactics">No specific verbal tactics (e.g. anchoring, labeling) were spotted in the transcript.</div>
                        )}
                    </div>
                </div>

                <button className="reset-review-btn" onClick={handleReset}>
                    🥋 Start a New Training Session
                </button>
            </div>
        );
    };

    return (
        <div className="app-layout">
            <Sidebar 
                mode={mode}
                setMode={setMode}
                persona={persona}
                setPersona={setPersona}
                handleReset={handleReset}
                theme={theme}
                toggleTheme={toggleTheme}
                activeTip={activeTip}
            />

            <main className="main-viewport">
                <header className="top-bar">
                    <div className="header-info">
                        <h2>{mode === "dojo" ? `Pitching to ${personas.find(p => p.id === persona)?.label}` : "Automated Procurement"}</h2>
                        <p>{mode === "dojo" ? "Try to close the deal without dropping the live profitability margin!" : "AI-driven vendor research and outreach automation."}</p>
                    </div>
                    <div className="user-profile">
                        <div className="avatar">S</div>
                    </div>
                </header>

                <div className="content-grid">
                    {concluding ? (
                        <div className="full-width-section loading-section">
                            <div className="loader-box">
                                <div className="loader-spinner"></div>
                                <h3>Analyzing Negotiation Strategy...</h3>
                                <p>Running financial ZOPA checks and auditing tactics. Please wait.</p>
                            </div>
                        </div>
                    ) : mode === "dojo" && !prepFinished ? (
                        <div className="full-width-section">
                            <PrepPlanner onStart={(data) => { setPrepData(data); setPrepFinished(true); }} initialData={prepData} />
                        </div>
                    ) : concludedReview ? (
                        <div className="full-width-section">
                            {renderPostNegotiationReport()}
                        </div>
                    ) : (
                        <>
                            <section className="primary-section glass-panel">
                                <ChatBox
                                    key={`${mode}-${persona}-${resetKey}`}
                                    setLastData={setLastData}
                                    mode={mode}
                                    persona={persona}
                                    prepData={prepData}
                                    priceHistory={priceHistory}
                                    setPriceHistory={setPriceHistory}
                                    onConclude={handleConclude}
                                />
                            </section>

                            <aside className="secondary-section">
                                <Dashboard data={lastData} mode={mode} prepData={prepData} priceHistory={priceHistory} />
                            </aside>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}