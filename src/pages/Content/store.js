import { selector, atomFamily, selectorFamily, useRecoilCallback } from 'recoil';
import axios from 'axios';
import { message } from 'antd';

// export const base = 'http://40.86.244.31:8088';

// export const reevalAtom = atom({
//     key: 'reeval/reebalAtom',
//     default: void 0
// });

// export const reevalStore = selector({
//     key: 'reeval/reevalStore',
//     get: async ({ get }) => {
//         const params = get(reevalAtom);
//         if (!params) return;
//         const { data } = await axios.post(`${base}/submit_page`, params);
//         console.log(data);
//     }
// });

export const base = 'https://knitter.ai/videomaker';
export const instance = axios.create({
    baseURL: 'https://knitter.ai/videomaker'
});

instance.interceptors.response.use(function (response) {
    const { data } = response;
    return data;
});

export const Store = {
    POST_PAGES: 'object_POST_PAGES',
    OPEN_PAGES_MODAL: 'false_OPEN_PAGES_MODAL',
    ASSETS: 'string_ASSETS_ID',
    VOICE: 'string_VOICE_CLIPS_ID',
    VIDEO: 'string_VIDEO_CLIPS_ID',
    VIDEO_TEMPLATES: 'string_VIDEO_TEMPLATES_ID'
};

export const resource = {
    string_ASSETS_ID: '/assets',
    string_VOICE_CLIPS_ID: '/voice_clips',
    string_VIDEO_CLIPS_ID: '/video_clips',
    string_VIDEO_TEMPLATES_ID: '/video_templates'
};

export const baseStore = atomFamily({
    key: 'reeval/baseStore',
    default: (key) => {
        const [type] = key.split('_');
        return { string: '', number: 0, array: [], object: {}, true: true, false: false }[type];
    }
});

export const baseAjax = selectorFamily({
    key: 'reeval/baseAjax',
    get: (config) => async () => {
        return await instance({ method: 'get', ...config });
    }
});

export const usePostPages = () => {
    return useRecoilCallback(({ snapshot }) => async (data) => {
        return await snapshot.getPromise(baseAjax({ method: 'post', url: '/pages', data }));
    });
};

export const useAjax = (options) => {
    return useRecoilCallback(({ snapshot }) => async (config) => {
        return await snapshot.getPromise(baseAjax({ ...options, ...config }));
    });
};

export const pagesStore = selector({
    key: 'reeval/getPagesStore',
    get: ({ get }) => {
        return get(baseAjax({ url: '/pages' }));
    }
});

export const pageStore = selector({
    key: 'reeval/getPageStore',
    get: ({ get }) => {
        const id = get(baseStore('string_PAGE_ID'));
        if (!id) return {};
        return get(baseAjax({ url: `/pages/${id}` }));
    }
});

export const storyStore = selector({
    key: 'reeval/storyStore',
    get: ({ get }) => {
        const id = get(baseStore('string_STORY_ID'));
        if (!id) return {};
        return get(baseAjax({ url: `/stories/${id}` }));
    }
});

export const productionStore = selector({
    key: 'reeval/productionStore',
    get: ({ get }) => {
        const id = get(baseStore('string_Production_ID'));
        if (!id) return {};
        return get(baseAjax({ url: `/productions/${id}` }));
    }
});

export const videoStore = selector({
    key: 'reeval/videoStore',
    get: ({ get }) => {
        const id = get(baseStore('string_VIDEO_ID'));
        if (!id) return {};
        return get(baseAjax({ url: `/video_clips/${id}` }));
    }
});

export const itemStore = selectorFamily({
    key: 'v2/itemStore',
    get:
        (key) =>
        ({ get }) => {
            const id = get(baseStore(key));
            if (!id) return {};
            return get(baseAjax({ url: `${resource[key]}/${id}` }));
        }
});

export const useProduceProduction = () => {
    return useRecoilCallback(() => async (productionId) => {
        await instance({ method: 'put', url: `/productions/${productionId}/produce` });
        message.success('Production produce success!!');
    });
};

// video template
export const videoTemplatesStore = baseAjax({ url: '/video_templates' });
export const videoTemplateItemIdStore = baseStore(Store.VIDEO_TEMPLATES);
export const videoTemplateItemStore = itemStore(Store.VIDEO_TEMPLATES);
// video clips
export const videoClipsStore = baseAjax({ url: '/video_clips' });
export const videoClipItemIdStore = baseStore(Store.VIDEO);
export const videoClipItemStore = itemStore(Store.VIDEO);
// voice clips
export const voiceClipsStore = baseAjax({ url: '/voice_clips' });
export const voiceClipItemIdStore = baseStore(Store.VOICE);
export const voiceClipItemStore = itemStore(Store.VOICE);

export const storiesStore = baseAjax({ url: '/stories' });
export const assetsStore = baseAjax({ url: '/assets' });
export const assetIdStore = baseStore(Store.ASSETS);
export const productionsStore = baseAjax({ url: '/productions' });
export const productionIdStore = baseStore('string_Production_ID');
