import { Modules } from './Constant';
import { RECrud } from './RECrud';
import { ruyiStore } from './store';
import React from 'react';
import { VoiceAssets } from './REAssets';

const module = Modules.VOICE_CLIPS;

export const ReVoiceClips = () => {
    const render = (data) => {
        return data?.length ? <VoiceAssets data={data} module={module} /> : <></>;
    };
    return <RECrud label={'Voice Clips'} selector={ruyiStore({ module })} add={false} listRender={render} />;
};