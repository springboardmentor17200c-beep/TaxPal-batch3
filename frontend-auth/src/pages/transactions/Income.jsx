import React, { useState } from "react";
import { useTransactions } from "../../context/TransactionContext";
import "../../styles/dashboard.css";
import IncomeInputForm from "../../components/IncomeInputForm";

const Income = () => {
    const { addTransaction } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (transactionData) => {
        addTransaction({ ...transactionData, type: "income" });
        setIsModalOpen(false);
    };

    return (
        <div className="page-container">
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Income</h2>
                <button className="primary-btn" style={{ width: 'auto' }} onClick={() => setIsModalOpen(true)}>
                    Record New Income
                </button>
            </div>

            {/* Transaction List would go here */}
            <div className="card empty-state">
                <p>No income transactions recorded yet.</p>
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
