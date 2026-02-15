import React, { useState } from "react";
import { useTransactions } from "../../context/TransactionContext";
import "../../styles/dashboard.css";

const Income = () => {
    const { addTransaction } = useTransactions();
    const [amount, setAmount] = useState("");
    const [source, setSource] = useState("");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!amount || !source || !date) {
                setError("Please fill in all fields");
                setLoading(false);
                return;
            }

            await addTransaction({ type: "income", amount: parseFloat(amount), source, date });
            setSuccess("Income Added Successfully!");
            setAmount("");
            setSource("");
            setDate("");
            
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message || "Failed to add income");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h2>Log Income</h2>
            <div className="card">
                <form onSubmit={handleSubmit} className="transaction-form">
                    {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '0.5rem' }}>{error}</div>}
                    {success && <div style={{ color: '#059669', marginBottom: '1rem', padding: '0.75rem', background: '#dcfce7', borderRadius: '0.5rem' }}>{success}</div>}
                    
                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Source</label>
                        <input
                            type="text"
                            placeholder="e.g. Client Payment"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <button type="submit" className="primary-btn" disabled={loading}>
                        {loading ? "Adding..." : "Add Income"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Income;
