import React, { createContext, useState, useContext, useEffect } from "react";
import { transactionAPI } from "../services/api";

const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch transactions on mount
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const result = await transactionAPI.getTransactions();
            setTransactions(result.transactions || result.data || []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
            setError(err.message);
            // Use empty array if fetch fails
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (transaction) => {
        try {
            const result = await transactionAPI.addTransaction(transaction);
            // Add new transaction to state
            setTransactions((prev) => [
                result.transaction || { id: Date.now(), ...transaction },
                ...prev,
            ]);
            return result;
        } catch (err) {
            console.error("Failed to add transaction:", err);
            throw err;
        }
    };

    return (
        <TransactionContext.Provider value={{ transactions, addTransaction, loading, error, fetchTransactions }}>
            {children}
        </TransactionContext.Provider>
    );
};
