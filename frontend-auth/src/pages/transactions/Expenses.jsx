import React, { useState } from "react";
import { useTransactions } from "../../context/TransactionContext";
import "../../styles/dashboard.css";
import ExpenseInputForm from "../../components/ExpenseInputForm";

const Expenses = () => {
    const { addTransaction } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (data) => {
        addTransaction({
            type: "expense",
            source: data.description,
            amount: parseFloat(data.amount),
            category: data.category,
            date: data.date,
            notes: data.notes
        });
        setIsModalOpen(false);
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
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                    Click "Record New Expense" to add a new transaction.
                </p>
                {/* Visual placeholder or list could go here */}
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
