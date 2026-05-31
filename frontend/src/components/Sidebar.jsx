import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const personas = [
    { id: "skeptical", label: "Skeptical Anna", icon: "🧐", desc: "Detailed & logical" },
    { id: "aggressive", label: "Tough Tom", icon: "🥷", desc: "Demands heavy discounts" },
    { id: "collaborative", label: "Friendly Fred", icon: "🤝", desc: "Seeks a win-win compromise" }
];

const Sidebar = ({ mode, setMode, persona, setPersona, handleReset, theme, toggleTheme, activeTip }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isProfilePage = location.pathname === '/profile';

    return (
        <nav className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-text" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <span>DealCraft</span>
                    <span>AI</span>
                </div>
                <div className="sidebar-actions">
                    <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Light/Dark Mode">
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>
                    <button 
                        className={`theme-toggle-btn ${isProfilePage ? 'active' : ''}`} 
                        onClick={() => navigate("/profile")} 
                        title="User Profile"
                    >
                        👤
                    </button>
                    <button className="theme-toggle-btn" onClick={logout} title="Logout">
                        🚪
                    </button>
                </div>
            </div>

            <div className="nav-menu">
                <span className="sidebar-section-title">Navigation</span>
                <button
                    className={`nav-item ${location.pathname === '/' ? "active" : ""}`}
                    onClick={() => navigate('/')}
                >
                    <span className="icon">🏠</span>
                    <span className="label">Home / Dojo</span>
                </button>
                
                {!isProfilePage && (
                    <>
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
                    </>
                )}
            </div>

            <div className="sidebar-footer">
                {!isProfilePage && (
                    <button className="reset-btn" onClick={handleReset}>
                        🔄 Reset Session
                    </button>
                )}
                {activeTip && (
                    <div className="tip-card">
                        <p>{activeTip}</p>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Sidebar;
