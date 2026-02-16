import React, { useState } from "react";
import { X } from "lucide-react";
import "./ExpenseInputForm.css";
import CustomDropdown from "./ui/CustomDropdown";

const ExpenseInputForm = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "",
        date: "",
        notes: ""
    });

    if (!isOpen) return null;

    const categories = ["Rent/Mortgage", "Food", "Transport", "Utilities", "Entertainment", "Healthcare", "Shopping", "Other"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategorySelect = (category) => {
        setFormData((prev) => ({ ...prev, category }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave(formData);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Record New Expense</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <p className="modal-subheader">
                    Add details about your expense to track your spending better.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group-custom">
                            <label className="input-label">Description</label>
                            <input
                                type="text"
                                name="description"
                                placeholder="e.g. Web Design Project"
                                className="form-input"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group-custom">
                            <label className="input-label">Amount</label>
                            <input
                                type="number"
                                name="amount"
                                placeholder="$ 0.00"
                                className="form-input"
                                value={formData.amount}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group-custom">
                            <label className="input-label">Category</label>
                            <CustomDropdown
                                options={categories}
                                placeholder="Select a category"
                                onSelect={handleCategorySelect}
                            />
                        </div>

                        <div className="form-group-custom">
                            <label className="input-label">Date</label>
                            <input
                                type="date"
                                name="date"
                                className="form-input"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group-custom full-width">
                            <label className="input-label">Notes (Optional)</label>
                            <textarea
                                name="notes"
                                placeholder="Add any additional details..."
                                className="form-input form-textarea"
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-save">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseInputForm;
