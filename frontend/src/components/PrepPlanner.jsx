import { useState } from "react";
import "./PrepPlanner.css";

export default function PrepPlanner({ onStart, initialData }) {
    const [targetPrice, setTargetPrice] = useState(initialData?.targetPrice || 25000);
    const [walkAwayPrice, setWalkAwayPrice] = useState(initialData?.walkAwayPrice || 15000);
    const [buyerMin, setBuyerMin] = useState(initialData?.buyerMin || 10000);
    const [buyerMax, setBuyerMax] = useState(initialData?.buyerMax || 30000);
    const [alternatives, setAlternatives] = useState(initialData?.alternatives || [
        { name: "Alternative Client B", cost: 18000, probability: 0.8, switchingCost: 1000 }
    ]);

    const addAlternative = () => {
        setAlternatives([...alternatives, { name: "", cost: 0, probability: 1.0, switchingCost: 0 }]);
    };

    const removeAlternative = (index) => {
        setAlternatives(alternatives.filter((_, i) => i !== index));
    };

    const updateAlternative = (index, field, value) => {
        const list = [...alternatives];
        list[index][field] = value;
        setAlternatives(list);
    };

    // Calculate individual EV: (Value * Probability) - Switching Cost
    const getEV = (alt) => {
        const cost = parseFloat(alt.cost) || 0;
        const prob = parseFloat(alt.probability) || 0;
        const swCost = parseFloat(alt.switchingCost) || 0;
        return (cost * prob) - swCost;
    };

    // Aggregate BATNA is the maximum expected value among alternatives
    const computedBATNA = alternatives.length > 0 
        ? Math.max(...alternatives.map(getEV), 0)
        : 0;

    const handleStart = () => {
        onStart({
            targetPrice: parseFloat(targetPrice),
            walkAwayPrice: parseFloat(walkAwayPrice),
            buyerMin: parseFloat(buyerMin),
            buyerMax: parseFloat(buyerMax),
            alternatives: alternatives.map(alt => ({
                name: alt.name || "Unnamed Alternative",
                cost: parseFloat(alt.cost) || 0,
                probability: parseFloat(alt.probability) || 0,
                switchingCost: parseFloat(alt.switchingCost) || 0
            })),
            batnaValue: computedBATNA
        });
    };

    // Quick validation
    const hasZopa = buyerMax >= walkAwayPrice;

    return (
        <div className="prep-planner glass-panel">
            <div className="prep-header">
                <span className="prep-tag">Step 1: Prep & Strategy</span>
                <h2>🥋 DealCraft Prep-Work Calculator</h2>
                <p>Before negotiating, calculate your fallback alternatives (BATNA) and map your expected Zone of Possible Agreement (ZOPA) to avoid emotional concessions.</p>
            </div>

            <div className="prep-grid">
                {/* Section A: Core Boundaries */}
                <div className="prep-section card-dark">
                    <h3>💰 Your Financial Boundaries</h3>
                    <div className="form-group">
                        <label>Target Price (Ideal Outcome)</label>
                        <div className="input-wrapper">
                            <span className="currency">₹</span>
                            <input 
                                type="number" 
                                value={targetPrice} 
                                onChange={(e) => setTargetPrice(e.target.value)} 
                                placeholder="e.g. 25000"
                            />
                        </div>
                        <span className="field-desc">The price you aim to close this deal at.</span>
                    </div>

                    <div className="form-group">
                        <label>Walk-Away Price (Reservation Value)</label>
                        <div className="input-wrapper">
                            <span className="currency">₹</span>
                            <input 
                                type="number" 
                                value={walkAwayPrice} 
                                onChange={(e) => setWalkAwayPrice(e.target.value)} 
                                placeholder="e.g. 15000"
                            />
                        </div>
                        <span className="field-desc">The absolute minimum you will accept. If the buyer offers less, you walk.</span>
                    </div>
                </div>

                {/* Section B: Opponent Estimates */}
                <div className="prep-section card-dark">
                    <h3>🤝 Buyer's Estimated Budget</h3>
                    <div className="form-row">
                        <div className="form-group half">
                            <label>Estimated Min Budget</label>
                            <div className="input-wrapper">
                                <span className="currency">₹</span>
                                <input 
                                    type="number" 
                                    value={buyerMin} 
                                    onChange={(e) => setBuyerMin(e.target.value)} 
                                    placeholder="e.g. 10000"
                                />
                            </div>
                        </div>
                        <div className="form-group half">
                            <label>Estimated Max Budget</label>
                            <div className="input-wrapper">
                                <span className="currency">₹</span>
                                <input 
                                    type="number" 
                                    value={buyerMax} 
                                    onChange={(e) => setBuyerMax(e.target.value)} 
                                    placeholder="e.g. 30000"
                                />
                            </div>
                        </div>
                    </div>
                    <span className="field-desc">The range you guess the buyer is willing to spend.</span>

                    {/* ZOPA Preview */}
                    <div className="zopa-status-box">
                        <span className="status-title">Initial ZOPA Status:</span>
                        {hasZopa ? (
                            <span className="status-tag status-green">Positive ZOPA Overlap (₹{walkAwayPrice.toLocaleString()} - ₹{buyerMax.toLocaleString()})</span>
                        ) : (
                            <span className="status-tag status-red">Warning: Negative ZOPA. Walk-away exceeds Buyer's Max!</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Section C: BATNA & Alternatives */}
            <div className="prep-section alternatives-section card-dark">
                <div className="section-header-row">
                    <h3>📋 Fallback Alternatives (BATNA Calculator)</h3>
                    <button className="add-alt-btn" onClick={addAlternative}>➕ Add Option</button>
                </div>
                <p className="section-desc">If this negotiation fails, what are your fallback options? We calculate the Expected Value (EV) of each option below.</p>

                {alternatives.map((alt, index) => (
                    <div key={index} className="alternative-row">
                        <input 
                            type="text" 
                            className="alt-input alt-name" 
                            value={alt.name} 
                            onChange={(e) => updateAlternative(index, "name", e.target.value)} 
                            placeholder="e.g. Quote from secondary buyer"
                        />
                        <div className="alt-metric">
                            <label>Value (₹)</label>
                            <input 
                                type="number" 
                                value={alt.cost} 
                                onChange={(e) => updateAlternative(index, "cost", e.target.value)} 
                                placeholder="Value"
                            />
                        </div>
                        <div className="alt-metric">
                            <label>Probability (0-1)</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                min="0" 
                                max="1" 
                                value={alt.probability} 
                                onChange={(e) => updateAlternative(index, "probability", e.target.value)} 
                                placeholder="e.g. 0.8"
                            />
                        </div>
                        <div className="alt-metric">
                            <label>Switching Cost (₹)</label>
                            <input 
                                type="number" 
                                value={alt.switchingCost} 
                                onChange={(e) => updateAlternative(index, "switchingCost", e.target.value)} 
                                placeholder="Friction cost"
                            />
                        </div>
                        <div className="alt-ev-badge">
                            <span className="label">Expected Value</span>
                            <span className="value">₹{getEV(alt).toLocaleString()}</span>
                        </div>
                        <button className="remove-alt-btn" onClick={() => removeAlternative(index)}>🗑️</button>
                    </div>
                ))}

                {alternatives.length === 0 && (
                    <div className="empty-alts">
                        No alternatives listed. Walking away carries 100% risk (₹0 value fallback).
                    </div>
                )}
            </div>

            {/* Calculations and Action */}
            <div className="prep-summary-card">
                <div className="summary-metrics">
                    <div className="summary-stat">
                        <span className="label">Expected BATNA Value</span>
                        <span className="value text-purple">₹{computedBATNA.toLocaleString()}</span>
                    </div>
                    <div className="summary-stat">
                        <span className="label">Your Walk-Away Margin</span>
                        <span className={`value ${walkAwayPrice >= computedBATNA ? 'text-green' : 'text-yellow'}`}>
                            ₹{walkAwayPrice.toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="summary-advice">
                    <p>
                        💡 <strong>Math Check:</strong> Your Walk-Away Price is <strong>₹{walkAwayPrice.toLocaleString()}</strong>, 
                        and your calculated BATNA expected fallback value is <strong>₹{computedBATNA.toLocaleString()}</strong>.
                        {walkAwayPrice < computedBATNA ? (
                            " Warning: Your walk-away is LOWER than your BATNA value. You risk settling for a deal that is worse than your fallback option."
                        ) : (
                            " Your walk-away is logically anchored above your BATNA fallback value."
                        )}
                    </p>
                </div>
                <button className="start-negotiation-btn" onClick={handleStart}>
                    ⚡ Lock Prep-Work & Start Negotiation Dojo
                </button>
            </div>
        </div>
    );
}
