import { Navigate } from 'react-router';
import { REAssets } from './REAssets';
import { REPages } from './REPages';
import { REProductions } from './REProductions';
import { REStories } from './REStories';
import { REVideoClips } from './REVideoClips';
import { REVideoTemplates } from './REVideoTemplates';
import { REVoiceClips } from './REVoiceClips';
import { ReEvalAppLayout } from './ReEvalAppLayout';
import React from 'react';

export const routes = [
    {
        path: '/',
        element: <ReEvalAppLayout />,
        children: [
            { path: '/', element: <Navigate to="/pages" replace /> },
            { path: '/pages', element: <REPages />, index: true },
            { path: '/stories', element: <REStories /> },
            { path: '/productions', element: <REProductions /> },
            { path: '/assets', element: <REAssets /> },
            { path: '/clips/video', element: <REVideoClips /> },
            { path: '/clips/voice', element: <REVoiceClips /> },
            { path: '/templates/video', element: <REVideoTemplates /> }
        ]
    }
];
