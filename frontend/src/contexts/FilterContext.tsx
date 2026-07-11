import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from "react";

type CategoryFilter = 'todos' | 'labios' | 'pele' | 'olhos' | 'skincare';

interface FilterContextData {
  selectedCategory: CategoryFilter;
  setSelectedCategory: (category: CategoryFilter) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FilterContext = createContext<FilterContextData>({} as FilterContextData);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <FilterContext.Provider value={{ selectedCategory, setSelectedCategory, searchTerm, setSearchTerm }}>
      {children}
    </FilterContext.Provider>
  );
};

// Hook customizado seguindo o padrão da sua arquitetura
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilters deve ser utilizado dentro de um FilterProvider');
  return context;
};
