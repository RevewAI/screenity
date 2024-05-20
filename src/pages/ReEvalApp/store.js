import axios from 'axios';
import { Constants, Modules, Resources } from './Constant';
import { atom, selectorFamily, useRecoilCallback } from 'recoil';
import { message } from 'antd';

export const ruyi = axios.create({
    baseURL: Constants.RESOURCE_BASE
});

ruyi.interceptors.response.use((response) => {
    const { data } = response;
    return data;
});

/**
 * 控制所有的请求重新请求数据
 */
export const reloadAtom = atom({ key: 're/reload', default: Math.random() });

/**
 * axios ruyi
 */
export const ruyiStore = selectorFamily({
    key: 're/ruyi',
    get:
        (config = {}) =>
        async ({ get }) => {
            get(reloadAtom);
            const { module, url, method = 'get', params = {}, ...rest } = config;
            const options = {};
            if (module && !url) {
                const uri = Resources[module];
                const { id, ...params$ } = params;
                options.url = ['get', 'delete', 'put'].includes(method) ? (id ? `${uri}/${id}` : uri) : uri;
                options.method = method;
                options.params = params$;
            }
            const { data = [], ...extra } = await ruyi({ method, url, params, ...rest, ...options });
            return {
                ...extra,
                data:
                    data?.map?.((item) => {
                        item.module = module;
                        return item;
                    }) ?? data
            };
        }
});

/**
 * crud
 */
export const useRuyi = (module) => {
    return useRecoilCallback(({ snapshot, refresh }) => (action) => {
        const actionMap = {
            detail: async (params) => await snapshot.getPromise(ruyiStore({ module, params })),
            remove: async (params) => {
                await snapshot.getPromise(ruyiStore({ module, params, method: 'delete' }));
                refresh(ruyiStore({ module }));
                message.success('删除成功！');
            },
            put: async (params, data, config) => {
                const method = 'put';
                await snapshot.getPromise(ruyiStore({ module, params, data, method, ...config }));
                refresh(ruyiStore({ module }));
                refresh(ruyiStore({ module, params }));
                message.success('更新成功');
            },
            add: async (data) => {
                await snapshot.getPromise(ruyiStore({ module, data, method: 'post' }));
                refresh(ruyiStore({ module }));
                message.success('新建成功！');
            }
        };
        return action ? actionMap[action] : actionMap;
    });
};
