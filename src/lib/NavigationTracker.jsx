import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { data } from '@/platform/entities';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Log user activity when navigating to a page
    useEffect(() => {
        // Extract page name from pathname
        const pathname = location.pathname;
        let pageName;

        if (pathname === '/' || pathname === '') {
            pageName = mainPageKey;
        } else {
            // Remove leading slash and get the first segment
            const pathSegment = pathname.replace(/^\//, '').split('/')[0];

        if (pathSegment.toLowerCase() === 'creatoros' || pathSegment.toLowerCase() === 'creatorstudio') {
            pageName = 'CreatorStudio';
        } else {
            // Try case-insensitive lookup in Pages config
            const pageKeys = Object.keys(Pages);
            const matchedKey = pageKeys.find(
                key => key.toLowerCase() === pathSegment.toLowerCase()
            );

            pageName = matchedKey || null;
        }
        }

        if (isAuthenticated && pageName) {
            data.ActivityLog.create({ type: 'navigation', page: pageName }).catch(() => {
                // Telemetry must never break navigation.
            });
        }
    }, [location, isAuthenticated, Pages, mainPageKey]);

    return null;
}