import React, { useState, createContext, useContext, useCallback } from 'react';

export type Gender = 'men' | 'women';

interface GenderContextType {
  gender: Gender;
  setGender: (gender: Gender) => void;
  toggleGender: () => void;
  collectionSuffix: string;
}

const GenderContext = createContext<GenderContextType | undefined>(undefined);

export function GenderProvider({ children }: { children: React.ReactNode }) {
  const [gender, setGenderState] = useState<Gender>(() => {
    const saved = localStorage.getItem('vppa_gender');
    return (saved === 'women' ? 'women' : 'men') as Gender;
  });

  const setGender = useCallback((g: Gender) => {
    setGenderState(g);
    localStorage.setItem('vppa_gender', g);
  }, []);

  const toggleGender = useCallback(() => {
    setGender(gender === 'men' ? 'women' : 'men');
  }, [gender, setGender]);

  const collectionSuffix = `_${gender}`;

  return (
    <GenderContext.Provider value={{ gender, setGender, toggleGender, collectionSuffix }}>
      {children}
    </GenderContext.Provider>
  );
}

export function useGender() {
  const context = useContext(GenderContext);
  if (context === undefined) {
    throw new Error('useGender must be used within a GenderProvider');
  }
  return context;
}