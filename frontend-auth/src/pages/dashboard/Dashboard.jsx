import React from "react";
import { TrendingUp, TrendingDown, DollarSign, PlusCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTransactions } from "../../context/TransactionContext";
import { useUser } from "../../context/UserContext";
import "../../styles/dashboard.css";

const Dashboard = () => {
    const { transactions } = useTransactions();
    const { user } = useUser();
    const { currency } = user;
    const navigate = useNavigate(); // For button navigation

    const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, curr) => parseFloat(acc) + parseFloat(curr.amount), 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, curr) => parseFloat(acc) + parseFloat(curr.amount), 0);
    const taxEstimated = 0; // Placeholder as per image showing 00

    return (
        <div className="dashboard-container">
            <div className="dashboard-cards">
                <div className="card income-card">
                    <div className="card-header">
                        <h3>Monthly Income</h3>
                        <div className="trend-icon-up"><TrendingUp size={16} /></div>
                    </div>
                    <div className="amount">{currency}{totalIncome.toFixed(0)}</div>
                    <div className="trend-text positive">
                        <TrendingUp size={14} /> 12% More than last month
                    </div>
                </div>

                <div className="card expense-card">
                    <div className="card-header">
                        <h3>Monthly Expenses</h3>
                        <div className="trend-icon-up"><TrendingUp size={16} /></div>
                    </div>
                    <div className="amount">{currency}{totalExpense.toFixed(0)}</div>
                    <div className="trend-text positive">
                        <TrendingUp size={14} /> 5% More than last month
                    </div>
                </div>

                <div className="card tax-card">
                    <h3>Tax Estimated</h3>
                    <div className="amount">{currency}{taxEstimated.toFixed(2)}</div>
                </div>
            </div>

            <div className="dashboard-actions">
                <button className="action-btn" onClick={() => navigate('/income')}>
                    <PlusCircle size={18} /> Add Income
                </button>
                <button className="action-btn" onClick={() => navigate('/expenses')}>
                    <PlusCircle size={18} /> Add Expenses
                </button>
            </div>

            <div className="card card-list">
                <h3>Recent Transactions</h3>
                <div style={{ marginTop: '1rem' }}>
                    {transactions.length === 0 ? (
                        <p style={{ color: '#94a3b8' }}>No transactions yet.</p>
                    ) : (
                        transactions.map(t => (
                            <div key={t.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '12px 0',
                                borderBottom: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        background: t.type === 'income' ? '#dcfce7' : '#fee2e2',
                                        color: t.type === 'income' ? '#166534' : '#991b1b'
                                    }}>
                                        {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{t.source || t.category}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{t.date}</div>
                                    </div>
                                </div>
                                <div style={{
                                    fontWeight: 600,
                                    color: t.type === 'income' ? '#16a34a' : '#ef4444'
                                }}>
                                    {t.type === 'income' ? '+' : '-'}{currency}{parseFloat(t.amount).toFixed(2)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
