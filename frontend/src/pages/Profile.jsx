import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get('/auth/profile');
                setProfile(res.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        if (nextTheme === "light") {
            document.documentElement.classList.add("light");
        } else {
            document.documentElement.classList.remove("light");
        }
    };

    if (loading) return <div className="profile-loading">Loading profile...</div>;
    if (error) return <div className="profile-error">{error}</div>;
    if (!profile) return null;

    return (
        <div className="app-layout">
            <Sidebar 
                theme={theme}
                toggleTheme={toggleTheme}
            />
            
            <main className="main-viewport">
                <header className="top-bar">
                    <div className="header-info">
                        <h2>User Profile & Statistics</h2>
                        <p>Analyze your long-term negotiation performance and tactical history.</p>
                    </div>
                    <button className="control-btn back-btn" onClick={() => navigate('/')}>
                        🏠 Back to Dojo
                    </button>
                </header>

                <div className="profile-container glass-panel">
                    <div className="profile-header">
                        <div className="profile-info">
                            <h1>👤 {profile.username}</h1>
                            <p className="profile-email">{profile.email}</p>
                        </div>
                        <div className="profile-stats">
                            <div className="stat-card card-dark">
                                <span className="stat-label">Negotiations</span>
                                <span className="stat-value">{profile.negotiation_count}</span>
                            </div>
                            <div className="stat-card card-dark">
                                <span className="stat-label">Avg. Value Claimed</span>
                                <span className="stat-value">{profile.avg_value_claimed}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="history-section">
                        <h2>📜 Negotiation History</h2>
                        {profile.recent_history.length > 0 ? (
                            <div className="history-list">
                                {profile.recent_history.map((item) => (
                                    <div key={item.id} className="history-item card-dark">
                                        <div className="history-item-header">
                                            <span className="history-mode-badge">{item.mode.toUpperCase()}</span>
                                            <span className="history-date">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="history-item-content">
                                            <div className="history-main-info">
                                                <p><strong>Persona:</strong> {item.persona}</p>
                                                <p><strong>Status:</strong> 
                                                    <span className={item.agreement_reached === 'true' ? 'text-green' : 'text-red'}>
                                                        {item.agreement_reached === 'true' ? ' Agreement Reached' : ' Walked Away'}
                                                    </span>
                                                </p>
                                                {item.final_price && (
                                                    <p><strong>Final Price:</strong> ₹{item.final_price.toLocaleString()}</p>
                                                )}
                                            </div>
                                            <div className="history-score-info">
                                                <span className="history-score-label">Value Claimed</span>
                                                <div className="history-score-bar-bg">
                                                    <div 
                                                        className="history-score-bar-fill" 
                                                        style={{ 
                                                            width: `${item.value_claimed_pct}%`,
                                                            backgroundColor: item.value_claimed_pct >= 70 ? '#00e5ff' : (item.value_claimed_pct >= 40 ? '#ffb300' : '#ff3d00')
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="history-score-value">{item.value_claimed_pct}%</span>
                                            </div>
                                        </div>
                                        <div className="history-feedback">
                                            <p className="feedback-preview">"{item.feedback.substring(0, 100)}..."</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-history">
                                <p>No negotiation sessions found. Start your first session in the Dojo! 🥋</p>
                                <button className="auth-button" onClick={() => navigate('/')} style={{ marginTop: '1rem', width: 'auto', padding: '0.75rem 2rem' }}>
                                    Go to Dojo
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
