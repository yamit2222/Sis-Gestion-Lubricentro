import { useState } from 'react';
import '@styles/search.css';

function Search({ value, onChange, onSearch, placeholder }) {
    const [searchValue, setSearchValue] = useState(value || '');
    
    const handleChange = (e) => {
        const newValue = e.target.value;
        setSearchValue(newValue);
        
        if (onChange) {
            onChange(e);
        }
        
        if (onSearch) {
            onSearch(newValue);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={value !== undefined ? value : searchValue}
                onChange={handleChange}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    maxWidth: 400,
                    padding: "10px 16px",
                    fontSize: 16,
                    borderRadius: 8,
                    border: "1px solid #444",
                    background: "#2C303A",
                    color: "#F3F4F6",
                    boxShadow: "0 1px 4px #0002",
                    outline: "none",
                    margin: "0 auto",
                    display: "block"
                }}
            />
        </div>
    )
}

export default Search;