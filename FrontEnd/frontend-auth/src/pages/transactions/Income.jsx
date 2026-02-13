import React, { useState } from "react";
import { useTransactions } from "../../context/TransactionContext";
import "../../styles/dashboard.css";

const Income = () => {
    const { addTransaction } = useTransactions();
    const [amount, setAmount] = useState("");
    const [source, setSource] = useState("");
    const [date, setDate] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        addTransaction({ type: "income", amount, source, date });
        alert("Income Added Successfully!");
        setAmount("");
        setSource("");
        setDate("");
    };

    return (
        <div className="page-container">
            <h2>Log Income</h2>
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
                        <label>Source</label>
                        <input
                            type="text"
                            placeholder="e.g. Client Payment"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
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
                    <button type="submit" className="primary-btn">Add Income</button>
                </form>
            </div>
        </div>
    );
};

export default Income;
