import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Home, 
    Swords, 
    Briefcase, 
    User, 
    LogOut, 
    Sun, 
    Moon, 
    RotateCcw, 
    ShieldAlert, 
    Flame, 
    Handshake,
    Lightbulb
} from "lucide-react";

const personas = [
    { id: "skeptical", label: "Skeptical Anna", icon: ShieldAlert, desc: "Detailed & logical" },
    { id: "aggressive", label: "Tough Tom", icon: Flame, desc: "Demands heavy discounts" },
    { id: "collaborative", label: "Friendly Fred", icon: Handshake, desc: "Seeks a win-win compromise" }
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
                        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                    </button>
                    <button 
                        className={`theme-toggle-btn ${isProfilePage ? 'active' : ''}`} 
                        onClick={() => navigate("/profile")} 
                        title="User Profile"
                    >
                        <User size={15} />
                    </button>
                    <button className="theme-toggle-btn" onClick={logout} title="Logout">
                        <LogOut size={15} />
                    </button>
                </div>
            </div>

            <div className="nav-menu">
                <span className="sidebar-section-title">Navigation</span>
                <button
                    className={`nav-item ${location.pathname === '/' ? "active" : ""}`}
                    onClick={() => navigate('/')}
                >
                    <Home size={16} className="icon" />
                    <span className="label">Home / Dojo</span>
                </button>
                
                {!isProfilePage && (
                    <>
                        <span className="sidebar-section-title">Mode Selection</span>
                        <button
                            className={`nav-item ${mode === "dojo" ? "active" : ""}`}
                            onClick={() => { setMode("dojo"); handleReset(); }}
                        >
                            <Swords size={16} className="icon" />
                            <span className="label">Training Dojo</span>
                        </button>
                        <button
                            className={`nav-item ${mode === "procurement" ? "active" : ""}`}
                            onClick={() => { setMode("procurement"); handleReset(); }}
                        >
                            <Briefcase size={16} className="icon" />
                            <span className="label">Procurement</span>
                        </button>

                        {mode === "dojo" && (
                            <>
                                <span className="sidebar-section-title">Choose Opponent</span>
                                <div className="opponent-list">
                                    {personas.map((p) => {
                                        const PersonaIcon = p.icon;
                                        return (
                                            <button
                                                key={p.id}
                                                className={`opponent-item ${persona === p.id ? "selected" : ""}`}
                                                onClick={() => { setPersona(p.id); handleReset(); }}
                                            >
                                                <div className="opp-icon-wrapper">
                                                    <PersonaIcon size={16} className="opp-icon" />
                                                </div>
                                                <div className="opp-info">
                                                    <span className="opp-label">{p.label}</span>
                                                    <span className="opp-desc">{p.desc}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            <div className="sidebar-footer">
                {!isProfilePage && (
                    <button className="reset-btn" onClick={handleReset}>
                        <RotateCcw size={14} />
                        <span>Reset Session</span>
                    </button>
                )}
                {activeTip && (
                    <div className="tip-card">
                        <Lightbulb size={14} className="tip-icon" />
                        <p>{activeTip.replace("💡 ", "").replace("Tip: ", "")}</p>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Sidebar;
