import React, { useState } from "react";
import { useTransactions } from "../../context/TransactionContext";
import "../../styles/dashboard.css";
import ExpenseInputForm from "../../components/ExpenseInputForm";

const Expenses = () => {
    const { addTransaction } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (transactionData) => {
        addTransaction({ ...transactionData, type: "expense" });
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

            {/* Transaction List would go here */}
            <div className="card empty-state">
                <p>No expense transactions recorded yet.</p>
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
