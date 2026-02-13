import React, { createContext, useState, useContext } from "react";

const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([
        { id: 1, type: "income", source: "Website Project", amount: 1200, date: "2024-03-10" },
        { id: 2, type: "expense", category: "Software License", amount: 45, date: "2024-03-11" },
        { id: 3, type: "income", source: "Logo Design", amount: 300, date: "2024-03-12" },
        { id: 4, type: "expense", category: "Internet Bill", amount: 60, date: "2024-03-12" },
    ]);

    const addTransaction = (transaction) => {
        setTransactions((prev) => [
            { id: Date.now(), ...transaction },
            ...prev,
        ]);
    };

    return (
        <TransactionContext.Provider value={{ transactions, addTransaction }}>
            {children}
        </TransactionContext.Provider>
    );
};
