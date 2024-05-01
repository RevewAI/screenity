import { Modules } from './Constant';
import { RECrud } from './RECrud';
import { ruyiStore } from './store';
import React from 'react';
import { VideoAssets } from './REAssets';

const module = Modules.VIDEO_CLIPS;
export const ReVideoClips = () => {
    const render = (data) => {
        return data?.length ? <VideoAssets data={data} module={module} /> : <></>;
    };
    return <RECrud label={'Video Clips'} selector={ruyiStore({ module })} add={false} listRender={render} />;
};
