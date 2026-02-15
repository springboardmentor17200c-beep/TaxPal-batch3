import React, { useState } from "react";
import { useTransactions } from "../../context/TransactionContext";
import "../../styles/dashboard.css";

const Expenses = () => {
    const { addTransaction } = useTransactions();
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
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
            if (!amount || !category || !date) {
                setError("Please fill in all fields");
                setLoading(false);
                return;
            }

            await addTransaction({ type: "expense", amount: parseFloat(amount), category, date });
            setSuccess("Expense Added Successfully!");
            setAmount("");
            setCategory("");
            setDate("");
            
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message || "Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h2>Log Expense</h2>
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
                        <label>Category</label>
                        <input
                            type="text"
                            placeholder="e.g. Software Subscription"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
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
                    <button type="submit" className="primary-btn" style={{ backgroundColor: '#ef4444' }} disabled={loading}>
                        {loading ? "Adding..." : "Add Expense"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Expenses;
