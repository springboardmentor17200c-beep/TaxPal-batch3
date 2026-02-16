import React, { useState } from "react";
import { useTransactions } from "../../context/TransactionContext";
import "../../styles/dashboard.css";
import ExpenseInputForm from "../../components/ExpenseInputForm";

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
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Expenses</h2>
                <button className="primary-btn" style={{ width: 'auto', backgroundColor: '#ef4444' }} onClick={() => setIsModalOpen(true)}>
                    Record New Expense
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

            <ExpenseInputForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
};

export default Expenses;
