import { useState, useEffect, useCallback } from 'react';
import type { ReferenceRange } from '../types/types';
import { useDatabase } from '../context/DatabaseContext';
import {
    getReferenceRangesByUnitId,
    getAllReferenceRanges,
} from '../services/Database/units.repository';
import { handleError } from 'src/utils/errorHandler';

export function useReferenceRanges(unitId?: string) {
    const { db } = useDatabase();
    const [ranges, setRanges] = useState<ReferenceRange[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadRanges = useCallback(async () => {
        if (!db) {
            setRanges([]);
            setIsLoading(false);
            return;
        }
        try {
            const data = unitId
                ? await getReferenceRangesByUnitId(db, unitId)
                : await getAllReferenceRanges(db);
            setRanges(data);
            setIsLoading(false);
        } catch (error) {
            handleError(error);
            setIsLoading(false);
        }
    }, [db, unitId]);

    useEffect(() => {
        loadRanges().catch(() => {});
    }, [loadRanges]);

    return { ranges, isLoading };
}
