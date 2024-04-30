import { Navigate } from 'react-router';
import { REAssets } from './REAssets';
import { REPages } from './REPages';
import { REProductions } from './REProductions';
import { REStories } from './REStories';
import { ReVideoClips } from './REVideoClips';
import { ReVideoTemplates } from './REVideoTemplates';
import { ReVoiceClips } from './REVoiceClips';
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
            { path: '/clips/video', element: <ReVideoClips /> },
            { path: '/clips/voice', element: <ReVoiceClips /> },
            { path: '/templates/video', element: <ReVideoTemplates /> }
        ]
    }
];
