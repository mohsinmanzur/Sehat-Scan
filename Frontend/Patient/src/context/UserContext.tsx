import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { PatientDTO } from '../types/patients';

interface UserContextValue {
    currentPatient: PatientDTO | null;
    setCurrentPatient: (p: PatientDTO | null) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    
    const [currentPatient, setCurrentPatient] = useState<PatientDTO | null>(null);

    return (
        <UserContext.Provider value={{ currentPatient, setCurrentPatient }}>
            {children}
        </UserContext.Provider>
    );
};

export const useCurrentPatient = (): UserContextValue => {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error('useCurrentPatient must be used within a UserProvider');
    }
    return ctx;
};
