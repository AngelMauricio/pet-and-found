"use client";

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-sand-100 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sand-600"></div>
        </div>
    )
});

export default function MapWrapper() {
    return <MapComponent />;
}