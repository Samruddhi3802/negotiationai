import { useState, useEffect } from "react";
import ChatBox from "../components/ChatBox";
import Dashboard from "../components/Dashboard";
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
    const [lastData, setLastData] = useState(null);
    const [mode, setMode] = useState("dojo");
    const [persona, setPersona] = useState("skeptical");
    const [resetKey, setResetKey] = useState(0);
    const [activeTip, setActiveTip] = useState("");
    const [theme, setTheme] = useState("dark");

    // Set a random tip on mount or when session resets
    useEffect(() => {
        const randomTip = negotiationTips[Math.floor(Math.random() * negotiationTips.length)];
        setActiveTip(randomTip);
    }, [resetKey, mode]);

    const handleReset = () => {
        setLastData(null);
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

    return (
        <div className="app-layout">
            <nav className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-text">
                        <span>DealCraft</span>
                        <span>AI</span>
                    </div>
                    <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Light/Dark Mode">
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>
                </div>

                <div className="nav-menu">
                    <span className="sidebar-section-title">Mode Selection</span>
                    <button
                        className={`nav-item ${mode === "dojo" ? "active" : ""}`}
                        onClick={() => { setMode("dojo"); handleReset(); }}
                    >
                        <span className="icon">🥋</span>
                        <span className="label">Training Dojo</span>
                    </button>
                    <button
                        className={`nav-item ${mode === "procurement" ? "active" : ""}`}
                        onClick={() => { setMode("procurement"); handleReset(); }}
                    >
                        <span className="icon">📦</span>
                        <span className="label">Procurement</span>
                    </button>

                    {mode === "dojo" && (
                        <>
                            <span className="sidebar-section-title">Choose Opponent</span>
                            <div className="opponent-list">
                                {personas.map((p) => (
                                    <button
                                        key={p.id}
                                        className={`opponent-item ${persona === p.id ? "selected" : ""}`}
                                        onClick={() => { setPersona(p.id); handleReset(); }}
                                    >
                                        <span className="opp-icon">{p.icon}</span>
                                        <div className="opp-info">
                                            <span className="opp-label">{p.label}</span>
                                            <span className="opp-desc">{p.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="sidebar-footer">
                    <button className="reset-btn" onClick={handleReset}>
                        🔄 Reset Session
                    </button>
                    <div className="tip-card">
                        <p>{activeTip}</p>
                    </div>
                </div>
            </nav>

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
                    <section className="primary-section glass-panel">
                        <ChatBox
                            key={`${mode}-${persona}-${resetKey}`}
                            setLastData={setLastData}
                            mode={mode}
                            persona={persona}
                        />
                    </section>

                    <aside className="secondary-section">
                        <Dashboard data={lastData} mode={mode} />
                    </aside>
                </div>
            </main>
        </div>
    );
}