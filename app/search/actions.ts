'use server';

import { searchDracin } from '@/lib/dramabox';
import { Subject } from '@/lib/api';
import { DramaboxItem } from '@/lib/dramabox';

export async function searchDracinAction(query: string, page: number = 1) {
    const dracinData = await searchDracin(query, page, 20);
    // Return raw data, mapping will happen in client or here.
    return dracinData;
}
