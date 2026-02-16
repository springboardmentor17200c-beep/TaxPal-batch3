import React, { useState } from "react";
import { useTransactions } from "../../context/TransactionContext";
import "../../styles/dashboard.css";
import IncomeInputForm from "../../components/IncomeInputForm";

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
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Income</h2>
                <button className="primary-btn" style={{ width: 'auto' }} onClick={() => setIsModalOpen(true)}>
                    Record New Income
                </button>
            </div>

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

            <IncomeInputForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
};

export default Income;
