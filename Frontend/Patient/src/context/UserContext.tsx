import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { PatientProfile } from '../types/patients';

interface UserContextValue {
    currentPatient: PatientProfile | null;
    setCurrentPatient: (p: PatientProfile | null) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [currentPatient, setCurrentPatient] = useState<PatientProfile | null>(
        null
    );

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
