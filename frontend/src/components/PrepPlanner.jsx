import { useState } from "react";
import "./PrepPlanner.css";
import { ChevronLeft, ChevronRight, Check, Plus, Trash2, AlertTriangle, Lightbulb } from "lucide-react";

export default function PrepPlanner({ onStart, initialData }) {
    const [step, setStep] = useState(1);
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

    const getEV = (alt) => {
        const cost = parseFloat(alt.cost) || 0;
        const prob = parseFloat(alt.probability) || 0;
        const swCost = parseFloat(alt.switchingCost) || 0;
        return (cost * prob) - swCost;
    };

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

    const hasZopa = buyerMax >= walkAwayPrice;

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="prep-planner glass-panel">
            <div className="prep-header">
                <span className="prep-tag">Strategic Prep-Work</span>
                <h2>DealCraft Prep-Work Calculator</h2>
                <p>Before negotiating, calculate your fallback alternatives (BATNA) and map your expected Zone of Possible Agreement (ZOPA) to avoid emotional concessions.</p>
            </div>

            {/* Step Progress Tracker */}
            <div className="wizard-progress-bar">
                <div className={`progress-step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
                    <div className="step-number">{step > 1 ? <Check size={14} /> : "1"}</div>
                    <span className="step-label">Boundaries</span>
                </div>
                <div className="step-connector"></div>
                <div className={`progress-step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
                    <div className="step-number">{step > 2 ? <Check size={14} /> : "2"}</div>
                    <span className="step-label">Buyer Estimates</span>
                </div>
                <div className="step-connector"></div>
                <div className={`progress-step ${step >= 3 ? "active" : ""}`}>
                    <div className="step-number">3</div>
                    <span className="step-label">Alternatives & BATNA</span>
                </div>
            </div>

            <div className="wizard-step-content">
                {/* Step 1: Core Boundaries */}
                {step === 1 && (
                    <div className="prep-section card-dark animate-fade-in">
                        <div className="section-title-wrapper">
                            <h3>Your Financial Boundaries</h3>
                            <p className="section-subtitle">Define your target ideal deal and the absolute worst terms you can accept.</p>
                        </div>
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
                )}

                {/* Step 2: Opponent Estimates */}
                {step === 2 && (
                    <div className="prep-section card-dark animate-fade-in">
                        <div className="section-title-wrapper">
                            <h3>Buyer's Estimated Budget</h3>
                            <p className="section-subtitle">Forecast what the counterparty is prepared to pay to reveal potential overlap.</p>
                        </div>
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
                                <span className="status-tag status-red">
                                    <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                    <span>Warning: Negative ZOPA. Walk-away exceeds Buyer's Max!</span>
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: BATNA & Alternatives */}
                {step === 3 && (
                    <div className="prep-section alternatives-section card-dark animate-fade-in">
                        <div className="section-header-row">
                            <div className="section-title-wrapper">
                                <h3>Fallback Alternatives (BATNA Calculator)</h3>
                                <p className="section-desc">If this negotiation fails, what are your fallback options? We calculate the Expected Value (EV) of each option below.</p>
                            </div>
                            <button className="add-alt-btn" onClick={addAlternative}>
                                <Plus size={14} style={{ marginRight: '4px' }} />
                                <span>Add Option</span>
                            </button>
                        </div>

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
                                <button className="remove-alt-btn" onClick={() => removeAlternative(index)} title="Remove Alternative">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        {alternatives.length === 0 && (
                            <div className="empty-alts">
                                No alternatives listed. Walking away carries 100% risk (₹0 value fallback).
                            </div>
                        )}

                        {/* Summary & Lock Action */}
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
                                    <Lightbulb size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: '#c084fc' }} />
                                    <strong>Math Check:</strong> Your Walk-Away Price is <strong>₹{walkAwayPrice.toLocaleString()}</strong>, 
                                    and your calculated BATNA expected fallback value is <strong>₹{computedBATNA.toLocaleString()}</strong>.
                                    {walkAwayPrice < computedBATNA ? (
                                        " Warning: Your walk-away is LOWER than your BATNA value. You risk settling for a deal that is worse than your fallback option."
                                    ) : (
                                        " Your walk-away is logically anchored above your BATNA fallback value."
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="wizard-navigation-footer">
                {step > 1 ? (
                    <button className="wizard-nav-btn prev" onClick={prevStep}>
                        <ChevronLeft size={16} />
                        <span>Back</span>
                    </button>
                ) : (
                    <div /> // Spacing placeholder
                )}

                {step < 3 ? (
                    <button className="wizard-nav-btn next" onClick={nextStep}>
                        <span>Continue</span>
                        <ChevronRight size={16} />
                    </button>
                ) : (
                    <button className="start-negotiation-btn" onClick={handleStart}>
                        <span>Lock Prep-Work & Start Dojo</span>
                    </button>
                )}
            </div>
        </div>
    );
}
