import { Modules } from './Constant';
import { RECrud, commons } from './RECrud';
import { ruyiStore } from './store';
import React from 'react';
import { VideoAssets } from './REAssets';

const module = Modules.VIDEO_TEMPLATES;
export const ReVideoTemplates = () => {
    const render = (data) => {
        return data?.length ? <VideoAssets data={data} module={module} /> : <></>;
    };
    return <RECrud label={'Video Templates'} selector={ruyiStore({ module })} add={false} listRender={render} />;
};
