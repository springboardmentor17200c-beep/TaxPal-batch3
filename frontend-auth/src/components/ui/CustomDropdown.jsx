import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import "../../styles/dropdown.css";

const CustomDropdown = ({ options, placeholder, icon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className="dropdown-selected" onClick={toggleDropdown}>
        <div className="dropdown-left">
          {icon}
          <span>{selected || placeholder}</span>
        </div>
        <ChevronDown size={18} className={`arrow ${isOpen ? "rotate" : ""}`} />
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <div
              key={index}
              className={`dropdown-item ${selected === option ? "active" : ""}`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>

          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
