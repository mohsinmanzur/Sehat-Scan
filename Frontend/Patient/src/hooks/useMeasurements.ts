import { useState, useEffect, useCallback, useRef } from 'react';
import type { HealthMeasurement } from '../types/types';
import { useDatabase } from '../context/DatabaseContext';
import { useNetwork } from '../context/NetworkContext';
import { getMeasurementsByPatient } from '../services/Database/measurements.repository';
import { syncMeasurements } from '../services/Sync/sync.service';
import { handleError } from 'src/utils/errorHandler';

export function useMeasurements(patientId: string | undefined) {
    const { db } = useDatabase();
    const { isOnline, isDeviceOnly } = useNetwork();
    const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
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
                setMeasurements([]);
                setIsLoading(false);
            }
            return;
        }
        try {
            const cached = await getMeasurementsByPatient(db, patientId);
            if (isMounted.current) {
                setMeasurements(cached);
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
            await syncMeasurements(db, patientId);
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

    return { measurements, isLoading, isSyncing, isOffline: !isOnline, refresh, reloadFromCache: loadFromDb };
}
