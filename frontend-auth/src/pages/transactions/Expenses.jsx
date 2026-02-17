import React, { useState } from "react";
import { useTransactions } from "../../context/TransactionContext";
import "../../styles/dashboard.css";
import ExpenseInputForm from "../../components/ExpenseInputForm";

const Expenses = () => {
    const { transactions, addTransaction } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const expenseTransactions = transactions.filter(t => t.type === 'expense');

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

            <div className="card-list">
                {expenseTransactions.length === 0 ? (
                    <div className="empty-state">
                        <p>No expense transactions recorded yet.</p>
                    </div>
                ) : (
                    expenseTransactions.map((t) => (
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
                            <div style={{ fontWeight: 700, color: '#ef4444' }}>
                                -${parseFloat(t.amount).toFixed(2)}
                            </div>
                        </div>
                    ))
                )}
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
