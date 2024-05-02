import { Modules } from './Constant';
import { RECrud } from './RECrud';
import { ruyiStore } from './store';
import React from 'react';
import { VideoAssets } from './REAssets';

const module = Modules.VIDEO_CLIPS;
export const REVideoClips = () => {
    const render = (data, loading) => {
        return <VideoAssets data={data} module={module} loading={loading} />;
    };
    return <RECrud label={'Video Clips'} selector={ruyiStore({ module })} add={false} listRender={render} />;
};
