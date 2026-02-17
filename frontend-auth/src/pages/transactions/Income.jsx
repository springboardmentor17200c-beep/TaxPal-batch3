import React, { useState } from "react";
import { useTransactions } from "../../context/TransactionContext";
import "../../styles/dashboard.css";
import IncomeInputForm from "../../components/IncomeInputForm";

const Income = () => {
    const { transactions, addTransaction } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const incomeTransactions = transactions.filter(t => t.type === 'income');

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

            <div className="card-list">
                {incomeTransactions.length === 0 ? (
                    <div className="empty-state">
                        <p>No income transactions recorded yet.</p>
                    </div>
                ) : (
                    incomeTransactions.map((t) => (
                        <div key={t.id || t._id} className="transaction-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderBottom: '1px solid #e2e8f0',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{t.description || t.category}</span>
                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t.date} | {t.category}</span>
                            </div>
                            <div style={{ fontWeight: 700, color: '#16a34a' }}>
                                +${parseFloat(t.amount).toFixed(2)}
                            </div>
                        </div>
                    ))
                )}
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
