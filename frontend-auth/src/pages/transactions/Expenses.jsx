import React, { useState } from "react";
import { useTransactions } from "../../context/TransactionContext";
import "../../styles/dashboard.css";

const Expenses = () => {
    const { addTransaction } = useTransactions();
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        addTransaction({ type: "expense", amount, category, date });
        alert("Expense Added Successfully!");
        setAmount("");
        setCategory("");
        setDate("");
    };

    return (
        <div className="page-container">
            <h2>Log Expense</h2>
            <div className="card">
                <form onSubmit={handleSubmit} className="transaction-form">
                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
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
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="primary-btn" style={{ backgroundColor: '#ef4444' }}>Add Expense</button>
                </form>
            </div>
        </div>
    );
};

export default Expenses;
