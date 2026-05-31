import "./Dashboard.css";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function Dashboard({ data, mode, prepData, priceHistory }) {

    if (!data && !prepData) return (
        <div className="dashboard-placeholder">
            <p>Start negotiating to see live {mode === 'dojo' ? 'performance scoring' : 'procurement insights'}</p>
        </div>
    );

    const { scorecard, strategy, personality, vendor_list, draft_emails } = data || {};

    const radarData = mode === "dojo" && scorecard?.emotions ? [
        { subject: 'Confidence', A: scorecard.emotions.confidence, fullMark: 100 },
        { subject: 'Empathy', A: scorecard.emotions.empathy, fullMark: 100 },
        { subject: 'Aggression', A: scorecard.emotions.aggression, fullMark: 100 },
        { subject: 'Logic', A: scorecard.emotions.logic, fullMark: 100 },
    ] : [];

    const dealValue = scorecard?.deal_value_score || 0;
    const dealColor = dealValue >= 70 ? '#00e5ff' : (dealValue >= 40 ? '#ffb300' : '#ff3d00');

    // === 1. ZOPA CALCULATION AND RENDERING ===
    let zopaRender = null;
    if (mode === "dojo" && prepData) {
        const { targetPrice, walkAwayPrice, buyerMin, buyerMax } = prepData;
        
        // Calculate range limits with 10% outer padding
        const minBound = Math.min(buyerMin, walkAwayPrice) * 0.9;
        const maxBound = Math.max(buyerMax, targetPrice) * 1.1;
        const total = maxBound - minBound;

        const getPct = (val) => ((val - minBound) / total) * 100;

        const buyerLeft = getPct(buyerMin);
        const buyerWidth = getPct(buyerMax) - buyerLeft;

        const sellerLeft = getPct(walkAwayPrice);
        const sellerWidth = getPct(targetPrice) - sellerLeft;

        // Overlap (ZOPA) calculation
        const zopaMin = Math.max(buyerMin, walkAwayPrice);
        const zopaMax = Math.min(buyerMax, targetPrice);
        const hasZopa = zopaMax >= zopaMin;
        const zopaLeft = getPct(zopaMin);
        const zopaWidth = hasZopa ? (getPct(zopaMax) - zopaLeft) : 0;

        zopaRender = (
            <div className="stat-card zopa-card">
                <span className="stat-label">Zone of Possible Agreement (ZOPA)</span>
                <div className="zopa-slider-container">
                    <div className="zopa-scale">
                        <span>₹{Math.round(minBound).toLocaleString()}</span>
                        <span>₹{Math.round(maxBound).toLocaleString()}</span>
                    </div>
                    <div className="zopa-bars-container">
                        {/* Buyer Range */}
                        <div className="zopa-bar-track">
                            <span className="bar-label">Estimated Buyer:</span>
                            <div className="zopa-bar bg-buyer" style={{ left: `${buyerLeft}%`, width: `${buyerWidth}%` }}>
                                <span className="bar-value">₹{buyerMin.toLocaleString()} - ₹{buyerMax.toLocaleString()}</span>
                            </div>
                        </div>
                        {/* Seller Range */}
                        <div className="zopa-bar-track">
                            <span className="bar-label">Your Range:</span>
                            <div className="zopa-bar bg-seller" style={{ left: `${sellerLeft}%`, width: `${sellerWidth}%` }}>
                                <span className="bar-value">₹{walkAwayPrice.toLocaleString()} - ₹{targetPrice.toLocaleString()}</span>
                            </div>
                        </div>
                        {/* ZOPA Overlap */}
                        {hasZopa ? (
                            <div className="zopa-bar-track overlap-track">
                                <span className="bar-label">ZOPA:</span>
                                <div className="zopa-bar bg-zopa" style={{ left: `${zopaLeft}%`, width: `${zopaWidth}%` }}>
                                    <span className="bar-value">₹{zopaMin.toLocaleString()} - ₹{zopaMax.toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="no-zopa-warning">⚠️ No Overlapping ZOPA (Negative Overlap)</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // === 2. RISK INDEX CALCULATION ===
    let riskRender = null;
    if (mode === "dojo" && prepData) {
        const { targetPrice, walkAwayPrice } = prepData;
        
        // Find latest price proposed in history
        let currentPrice = null;
        if (priceHistory && priceHistory.length > 0) {
            const latest = priceHistory[priceHistory.length - 1];
            currentPrice = latest.userPrice || latest.aiPrice || null;
        }

        if (currentPrice !== null) {
            let risk = 0;
            if (currentPrice >= targetPrice) {
                risk = 0;
            } else if (currentPrice <= walkAwayPrice) {
                risk = 100;
            } else {
                risk = ((targetPrice - currentPrice) / (targetPrice - walkAwayPrice)) * 100;
            }

            const riskColor = risk >= 75 ? '#ff3d00' : (risk >= 35 ? '#ffb300' : '#00e5ff');

            riskRender = (
                <div className="stat-card risk-card">
                    <div className="risk-header">
                        <span className="stat-label">Concession Risk Index</span>
                        <span className="risk-value" style={{ color: riskColor }}>{Math.round(risk)}%</span>
                    </div>
                    <div className="risk-meter-wrapper">
                        <div className="risk-meter-bar">
                            <div className="risk-pointer" style={{ left: `${risk}%`, backgroundColor: riskColor }}></div>
                        </div>
                        <div className="risk-labels">
                            <span>Target (0% Risk)</span>
                            <span>Walk-Away (100% Risk)</span>
                        </div>
                    </div>
                    <span className="field-desc">
                        Current Price Offer: <strong>₹{currentPrice.toLocaleString()}</strong>
                    </span>
                </div>
            );
        }
    }

    // === 3. CONCESSION CURVE CHART ===
    let chartRender = null;
    if (mode === "dojo" && priceHistory && priceHistory.length > 0) {
        chartRender = (
            <div className="stat-card chart-card">
                <span className="stat-label">Concession Curve (Price Progress)</span>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={priceHistory}>
                            <XAxis dataKey="turn" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                            <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' }} />
                            <Line type="monotone" dataKey="userPrice" stroke="#00e5ff" strokeWidth={2.5} name="You" dot={{ r: 3 }} activeDot={{ r: 6 }} connectNulls />
                            <Line type="monotone" dataKey="aiPrice" stroke="#c084fc" strokeWidth={2.5} name="Buyer" dot={{ r: 3 }} activeDot={{ r: 6 }} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <h3 className="dashboard-title">
                {mode === "dojo" ? "🥋 Performance Stats" : "🔍 Procurement Hub"}
            </h3>
            
            <div className="stats-grid">
                {/* Dojo Mode Widgets */}
                {mode === "dojo" && (
                    <>
                        {zopaRender}
                        {riskRender}
                        {chartRender}

                        {scorecard && (
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
                                                <Radar name="You" dataKey="A" stroke="#c084fc" fill="#c084fc" fillOpacity={0.5} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                
                                <div className="stat-card feedback-card">
                                    <span className="stat-label">AI Coach Feedback</span>
                                    <p className="feedback-text">{scorecard.feedback}</p>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Procurement Mode Widgets */}
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

                {strategy && (
                    <div className="stat-card">
                        <span className="stat-label">Strategy Focus</span>
                        <span className="stat-value">{strategy}</span>
                    </div>
                )}
                
                {personality && (
                    <div className="stat-card">
                        <span className="stat-label">User Personality</span>
                        <span className="stat-value">{personality}</span>
                    </div>
                )}
            </div>
        </div>
    );
}