import { useRecoilValueLoadable, useSetRecoilState } from 'recoil';
import { Modules, MsgKey } from './Constant';
import { RECrud, expandColumns } from './RECrud';
import { reloadAtom, ruyiStore } from './store';
import React, { useEffect } from 'react';
import { cleanReEvalURL } from './bus';

const module = Modules.PAGES;
const columns = [
    { dataIndex: 'id', title: 'ID', width: 260 },
    { dataIndex: 'title', title: 'Title', ellipsis: true },
    { dataIndex: 'url', title: 'URL', ellipsis: true },
    ...expandColumns(module, null, null, { action: { width: 100 } })
];
export const REPages = () => {
    const selector = ruyiStore({ module });
    const { contents } = useRecoilValueLoadable(selector);

    useEffect(() => {
        if (contents?.data?.length) {
            chrome.runtime.sendMessage({
                type: MsgKey.UPDATE_ACTION_COUNT,
                options: contents.data.map(({ url }) => cleanReEvalURL(url))
            });
        }
    }, [contents?.data?.length]);

    return <RECrud label={'Pages'} selector={selector} columns={columns} add={false} />;
};
