import React, { createContext, useContext, useState, ReactNode } from "react";
import { SearchContextType } from "../../types/type";

//tạo context có kiểu dữ liệu SearchContext hoặc undefined
const SearchContext = createContext<SearchContextType | undefined>(undefined);

//sử dụng provider cho các router cần search
export const SearchProvider = ({children} : {children: ReactNode}) => {
    const [searchQuery, setSearchQuery] = useState('');

    //điều kiện để search
    const clearSearch = () => setSearchQuery('');

    return (
        <SearchContext.Provider value={{searchQuery, setSearchQuery, clearSearch}}>
            {children}
        </SearchContext.Provider>
    )
}

//định nghĩa hook mới sử dụng để search
export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within SearchProvider');
    }
    return context;
}