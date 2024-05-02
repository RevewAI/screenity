import { Modules } from './Constant';
import { RECrud } from './RECrud';
import { ruyiStore } from './store';
import React from 'react';
import { VoiceAssets } from './REAssets';

const module = Modules.VOICE_CLIPS;

export const ReVoiceClips = () => {
    const render = (data, loading) => {
        return <VoiceAssets data={data} module={module} loading={loading} />;
    };
    return <RECrud label={'Voice Clips'} selector={ruyiStore({ module })} add={false} listRender={render} />;
};
