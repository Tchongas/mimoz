'use client';

import { useEffect } from 'react';

interface StoreTrackerProps {
  slug: string;
  name: string;
}

export function StoreTracker({ slug, name }: StoreTrackerProps) {
  useEffect(() => {
    // Save last visited store to localStorage
    localStorage.setItem('tapresente_last_store', JSON.stringify({ slug, name }));
  }, [slug, name]);

  return null;
}
