import { useState, useEffect, useCallback } from 'react';
import type { MeasurementUnit } from '../types/types';
import { useDatabase } from '../context/DatabaseContext';
import { getAllMeasurementUnits } from '../services/Database/units.repository';
import { handleError } from 'src/utils/errorHandler';

export function useMeasurementUnits() {
    const { db } = useDatabase();
    const [units, setUnits] = useState<MeasurementUnit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadUnits = useCallback(async () => {
        if (!db) {
            setUnits([]);
            setIsLoading(false);
            return;
        }
        try {
            const data = await getAllMeasurementUnits(db);
            setUnits(data);
            setIsLoading(false);
        } catch (error) {
            handleError(error);
            setIsLoading(false);
        }
    }, [db]);

    useEffect(() => {
        loadUnits().catch(() => {});
    }, [loadUnits]);

    return { units, isLoading };
}
