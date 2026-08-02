import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import type { Patient } from '../types/types';
import { getObject, removeValue } from 'src/services/Storage/storage.service';
import backend from 'src/services/Backend/backend.service';
import { router } from 'expo-router';
import { useDatabase } from './DatabaseContext';
import { useNetwork } from './NetworkContext';
import { upsertPatient } from '../services/Database/patient.repository';
import { clearAllData } from '../services/Database/database.service';
import { syncAllForPatient } from '../services/Sync/sync.service';
import { drainMutationQueue } from '../services/Sync/mutation.service';
import { useTheme } from './ThemeContext';

interface UserContextValue {
    currentPatient: Patient | null;
    setCurrentPatient: (p: Patient | null) => void;
    isInitialized: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const { db } = useDatabase();
    const { isOnline, isDeviceOnly } = useNetwork();
    const { setMode } = useTheme();

    const prevOnlineRef = useRef(false);
    const lastSyncedPatientRef = useRef<string | null>(null);

    useEffect(() => {
        if (currentPatient)
        {
            setMode('system');
        }
    }, [currentPatient]);

    // Keep patient row in SQLite current whenever the patient object changes (covers OTP login)
    useEffect(() => {
        if (currentPatient && db) {
            upsertPatient(db, currentPatient).catch(() => {});
        }
    }, [currentPatient, db]);

    useEffect(() => {
        backend.setOnLogout(() => {
            setCurrentPatient(null);
            removeValue('currentPatient');
            lastSyncedPatientRef.current = null;
            const clearAndNavigate = async () => {
                if (db) await clearAllData(db).catch(() => {});
                router.replace('/(auth)/Login');
            };
            clearAndNavigate();
        });

        const loadCurrentPatient = async () => {
            setIsInitialized(false);
            try {
                const patient = await getObject<Patient | null>('currentPatient');
                if (patient) {
                    setCurrentPatient(patient);
                }
            } catch (error) {
                console.error('Failed to load patient from storage:', error);
            } finally {
                setIsInitialized(true);
            }
        };
        loadCurrentPatient();
    }, [db]);

    // Sync whenever we have an online, ready patient not yet synced this session —
    // covers app restart, a fresh login/signup mid-session, and reconnecting after being offline.
    useEffect(() => {
        const justCameOnline = isOnline && !prevOnlineRef.current;
        const isNewPatientThisSession = !!currentPatient?.id && lastSyncedPatientRef.current !== currentPatient.id;

        if (isOnline && !isDeviceOnly && currentPatient?.id && db && (justCameOnline || isNewPatientThisSession)) {
            lastSyncedPatientRef.current = currentPatient.id;
            drainMutationQueue(db, currentPatient.id).catch(() => {});
            syncAllForPatient(db, currentPatient.id).catch(() => {});
        }
        prevOnlineRef.current = isOnline;
    }, [isOnline, isDeviceOnly, currentPatient?.id, db]);

    return (
        <UserContext.Provider value={{ currentPatient, setCurrentPatient, isInitialized }}>
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
