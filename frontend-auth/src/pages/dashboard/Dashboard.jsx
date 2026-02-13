import React from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useTransactions } from "../../context/TransactionContext";
import { useUser } from "../../context/UserContext";
import "../../styles/dashboard.css";

const Dashboard = () => {
    const { transactions } = useTransactions();
    const { user } = useUser();
    const { currency } = user;

    const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, curr) => parseFloat(acc) + parseFloat(curr.amount), 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, curr) => parseFloat(acc) + parseFloat(curr.amount), 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="dashboard-container">
            <div className="dashboard-cards">
                <div className="card">
                    <h3>Total Income</h3>
                    <div className="amount">{currency}{totalIncome.toFixed(2)}</div>
                    <div className="trend up">
                        <TrendingUp size={16} /> +12% this month
                    </div>
                </div>

                <div className="card">
                    <h3>Total Expenses</h3>
                    <div className="amount">{currency}{totalExpense.toFixed(2)}</div>
                    <div className="trend down">
                        <TrendingDown size={16} /> -5% this month
                    </div>
                </div>

                <div className="card">
                    <h3>Current Balance</h3>
                    <div className="amount" style={{ color: balance >= 0 ? '#10b981' : '#ef4444' }}>{currency}{balance.toFixed(2)}</div>
                    <div className="trend up">
                        <DollarSign size={16} /> Healthy
                    </div>
                </div>
            </div>

            <div className="card">
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
