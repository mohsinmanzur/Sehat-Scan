// src/context/ReportsContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { reports as initialReports, Report } from '@mock/reports';

type ReportsContextValue = {
    reports: Report[];
    refreshReports: () => void;
};

const ReportsContext = createContext<ReportsContextValue | undefined>(
    undefined
);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // Start with the mock reports (1–2 years of data for each patient)
    const [reports, setReports] = useState<Report[]>(initialReports);

    // In a real app this would re-fetch from backend
    const refreshReports = () => {
        setReports(initialReports);
    };

    const value = useMemo(
        () => ({
            reports,
            refreshReports,
        }),
        [reports]
    );

    return (
        <ReportsContext.Provider value={value}>
            {children}
        </ReportsContext.Provider>
    );
};

export const useReports = () => {
    const ctx = useContext(ReportsContext);
    if (!ctx) {
        throw new Error('useReports must be used inside ReportsProvider');
    }
    return ctx;
};
