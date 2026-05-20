import "./Dashboard.css";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function Dashboard({ data, mode }) {

    if (!data) return (
        <div className="dashboard-placeholder">
            <p>Start negotiating to see live {mode === 'dojo' ? 'performance scoring' : 'procurement insights'}</p>
        </div>
    );

    const { scorecard, strategy, personality, vendor_list, draft_emails } = data;

    const radarData = mode === "dojo" && scorecard?.emotions ? [
        { subject: 'Confidence', A: scorecard.emotions.confidence, fullMark: 100 },
        { subject: 'Empathy', A: scorecard.emotions.empathy, fullMark: 100 },
        { subject: 'Aggression', A: scorecard.emotions.aggression, fullMark: 100 },
        { subject: 'Logic', A: scorecard.emotions.logic, fullMark: 100 },
    ] : [];

    const dealValue = scorecard?.deal_value_score || 0;
    const dealColor = dealValue >= 70 ? '#00e5ff' : (dealValue >= 40 ? '#ffb300' : '#ff3d00');

    return (
        <div className="dashboard-container">
            <h3 className="dashboard-title">
                {mode === "dojo" ? "🥋 Performance Stats" : "🔍 Procurement Hub"}
            </h3>
            
            <div className="stats-grid">
                {mode === "dojo" && scorecard && (
                    <>
                        <div className="stat-card deal-card" style={{ '--deal-color': dealColor }}>
                            <div className="deal-header">
                                <span className="stat-label">Live Deal Profitability</span>
                                <span className="deal-status" style={{ color: dealColor }}>
                                    {dealValue >= 70 ? "Excellent" : (dealValue >= 40 ? "At Risk" : "Walking Away")}
                                </span>
                            </div>
                            <div className="score-row">
                                <div className="progress-container deal-progress-container">
                                    <div className="progress-bar deal-bar" style={{ width: `${dealValue}%`, background: dealColor }}></div>
                                </div>
                                <span className="score-value" style={{ color: dealColor }}>{dealValue}%</span>
                            </div>
                        </div>

                        <div className="stat-card radar-card">
                            <span className="stat-label">Emotional Intelligence Radar</span>
                            <div className="radar-wrapper">
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <Radar name="You" dataKey="A" stroke="#7c4dff" fill="#7c4dff" fillOpacity={0.5} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <span className="stat-label">AI Coach Feedback</span>
                            <p className="feedback-text">{scorecard.feedback}</p>
                        </div>
                    </>
                )}

                {mode === "procurement" && vendor_list && vendor_list.length > 0 && (
                    <div className="stat-card">
                        <span className="stat-label">Vendor Research</span>
                        <div className="vendor-list">
                            {vendor_list.map((v, i) => (
                                <div key={i} className="vendor-card">
                                    <div className="vendor-header">
                                        <span className="vendor-name">{v.name}</span>
                                        <span className="price-tag">{v.price_estimate}</span>
                                    </div>
                                    <p className="vendor-pros">✨ {v.pros}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {mode === "procurement" && draft_emails && draft_emails.length > 0 && (
                    <div className="stat-card">
                        <span className="stat-label">Ready-to-Send Drafts</span>
                        {draft_emails.slice(0, 2).map((d, i) => (
                            <div key={i} className="draft-wrapper">
                                <div className="email-preview">{d.email}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="stat-card">
                    <span className="stat-label">Strategy Focus</span>
                    <span className="stat-value">{strategy}</span>
                </div>
                
                <div className="stat-card">
                    <span className="stat-label">User Personality</span>
                    <span className="stat-value">{personality}</span>
                </div>
            </div>
        </div>
    );
}