import { useState, useEffect, useCallback, useRef } from 'react';
import type { AccessGrant } from '../types/types';
import { useDatabase } from '../context/DatabaseContext';
import { useNetwork } from '../context/NetworkContext';
import { getAccessGrantsByPatient } from '../services/Database/shares.repository';
import { syncShares } from '../services/Sync/sync.service';
import { handleError } from 'src/utils/errorHandler';

export function useShares(patientId: string | undefined) {
    const { db } = useDatabase();
    const { isOnline, isDeviceOnly } = useNetwork();
    const [shares, setShares] = useState<AccessGrant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const loadFromDb = useCallback(async () => {
        if (!db || !patientId) {
            if (isMounted.current) {
                setShares([]);
                setIsLoading(false);
            }
            return;
        }
        try {
            const cached = await getAccessGrantsByPatient(db, patientId);
            if (isMounted.current) {
                setShares(cached);
                setIsLoading(false);
            }
        } catch (error) {
            handleError(error);
            if (isMounted.current) setIsLoading(false);
        }
    }, [db, patientId]);

    const syncAndReload = useCallback(async () => {
        if (!db || !patientId || !isOnline || isDeviceOnly) return;
        if (isMounted.current) setIsSyncing(true);
        try {
            await syncShares(db, patientId);
            await loadFromDb();
        } finally {
            if (isMounted.current) setIsSyncing(false);
        }
    }, [db, patientId, isOnline, isDeviceOnly, loadFromDb]);

    useEffect(() => {
        loadFromDb().catch(() => {});
    }, [loadFromDb]);

    useEffect(() => {
        syncAndReload().catch(() => {});
    }, [syncAndReload]);

    const refresh = useCallback(async () => {
        if (isOnline && !isDeviceOnly) {
            await syncAndReload();
        } else {
            await loadFromDb();
        }
    }, [isOnline, isDeviceOnly, syncAndReload, loadFromDb]);

    return { shares, isLoading, isSyncing, isOffline: !isOnline, refresh };
}
