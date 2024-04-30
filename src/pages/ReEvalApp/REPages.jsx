import { useRecoilValueLoadable, useSetRecoilState } from 'recoil';
import { Modules, MsgKey } from './Constant';
import { RECrud, commons } from './RECrud';
import { reloadAtom, ruyiStore } from './store';
import React, { useEffect } from 'react';
import { cleanReEvalURL } from './bus';

const columns = [
    { dataIndex: 'id', title: 'ID', width: 260 },
    { dataIndex: 'title', title: 'Title', ellipsis: true },
    { dataIndex: 'url', title: 'URL', ellipsis: true },
    ...commons(Modules.PAGES)
];
export const REPages = () => {
    const selector = ruyiStore({ module: Modules.PAGES });
    const { contents } = useRecoilValueLoadable(selector);
    const setReload = useSetRecoilState(reloadAtom);
    const messageListener = (request) => {
        const { type, options } = request;
        if (type === MsgKey.APP_RELOAD) {
            setReload(options);
        }
    };
    useEffect(() => {
        if (contents?.data?.length) {
            chrome.runtime.sendMessage({
                type: MsgKey.UPDATE_ACTION_COUNT,
                options: contents.data.map(({ url }) => cleanReEvalURL(url))
            });
        }
    }, [contents?.data?.length]);

    useEffect(() => {
        chrome.runtime.onMessage.addListener(messageListener);
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    return <RECrud label={'Pages'} selector={selector} columns={columns} add={false} />;
};
