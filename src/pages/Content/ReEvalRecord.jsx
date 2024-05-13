import React, { useEffect, useContext, useState } from 'react';
import { contentStateContext } from './context/ContentState';
import { MsgKey, StorageKey } from '../ReEvalApp/Constant';
import { Button } from 'antd';
import { PlusOutlined, CheckOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { cleanReEvalURL } from '../ReEvalApp/bus';
import { isNil } from 'lodash-es';
import dayjs from 'dayjs';
import { compareState, plainJSONParse } from '../ReEvalApp/utils';

export const ReEvalRecord = () => {
    const [contentState, setContentState] = useContext(contentStateContext);
    const [addReEvalLoading, setAddReEvalLoading] = useState(false);
    const [pageAction, setPageAction] = useState(false);
    const [added, setAdded] = useState(false);
    const [showPageAction, setShowPageAction] = useState(true);
    const [penddingScreen, setPenddingScreen] = useState({ pending: false, total: 1, loaded: 0 });

    // Event listener (extension messaging)
    const messageListener = async (request, sender, sendResponse) => {
        const { type, options } = request;
        console.log('ooOoo', `messageListener -> ${dayjs().format('HH:mm:ss.SSS')}`, type, await compareState(contentState));

        if (type === MsgKey.REEVAL_PENDDING_STATE) {
            setContentState((prevContentState) => {
                return {
                    ...prevContentState,
                    ...options
                };
            });
        }

        // 发出录屏申请
        if (type === MsgKey.REEVAL_PENDDING_STORYBOARD) {
            await contentState.startStreaming();
        }

        if (type === MsgKey.ADD_TO_REEVAL) {
            setAddReEvalLoading(true);
        }

        if (type === MsgKey.ADDED_TO_REEVAL) {
            setAddReEvalLoading(false);
            setAdded(true);
        }
    };

    const storageListener = (changes, areaName) => {
        if (areaName === 'local' && changes[StorageKey.PAGE_ACTION_BAR]) {
            setPageAction(changes[StorageKey.PAGE_ACTION_BAR]?.newValue);
        }

        if (areaName === 'local' && changes[StorageKey.PAGES]) {
            const pages = changes[StorageKey.PAGES]?.newValue ?? [];
            const isAdded = pages.includes(cleanReEvalURL(window.location.href));
            setAdded(isAdded);
        }

        if (areaName === 'local' && changes[StorageKey.PENDDING_SCREEN]) {
            const pendding = changes[StorageKey.PENDDING_SCREEN]?.newValue ?? [];
            setPenddingScreen(pendding);
        }
    };

    const addToReEval = () => {
        setAddReEvalLoading(true);
        chrome.runtime.sendMessage({ type: StorageKey.ADD_TO_REEVAL });
    };

    useEffect(() => {
        chrome.runtime.sendMessage({
            type: MsgKey.IS_ADDED_REEVAL,
            options: { added, url: cleanReEvalURL(window.location.href) }
        });
    }, [added]);

    useEffect(() => {
        console.log('runtime storage');
        chrome.runtime.onMessage.addListener(messageListener);
        chrome.storage.onChanged.addListener(storageListener);
        chrome.storage.local.get([StorageKey.PAGE_ACTION_BAR, StorageKey.PAGES, StorageKey.PENDDING_SCREEN]).then((changes) => {
            console.log('oooooo-> changes', changes);
            const {
                [StorageKey.PAGE_ACTION_BAR]: checked,
                [StorageKey.PAGES]: pages = [],
                [StorageKey.PENDDING_SCREEN]: pending = {}
            } = changes;
            const isAdded = pages.includes(cleanReEvalURL(window.location.href));
            setAdded(isAdded);
            setPageAction(checked);
            setPenddingScreen(pending);
        });
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
            chrome.storage.onChanged.removeListener(storageListener);
        };
    }, []);

    useEffect(() => {
        const usp = new URLSearchParams(window.location.search);
        const reeval = usp.get('reeval');
        setShowPageAction(isNil(reeval));
    }, []);

    console.log(contentState);

    useEffect(() => {
        console.log('wapper', plainJSONParse(contentState));
    }, [contentState]);

    return (
        <>
            {penddingScreen?.run && (
                <div
                    style={{
                        position: 'fixed',
                        top: 32,
                        right: 32,
                        pointerEvents: 'none',
                        zIndex: 9999999999,
                        padding: 24,
                        borderRadius: 48,
                        background: '#fff',
                        filter: 'drop-shadow(0px 4px 100px rgba(0, 0, 0, 0.35))'
                    }}
                >
                    <span>正在加载StoryBoard相关页面，请等待...</span>
                    <span style={{ fontSize: 16, marginLeft: 8, fontWeight: 500 }}>
                        {penddingScreen.loaded} / {penddingScreen.total}
                    </span>
                </div>
            )}
            {showPageAction && (pageAction || addReEvalLoading) && (
                <Button
                    type={'primary'}
                    shape={'round'}
                    loading={addReEvalLoading}
                    icon={added ? <CheckOutlined /> : <PlusOutlined />}
                    className={`${styles['reeval-add']} ${added ? styles['added'] : ''}`}
                    onClick={addToReEval}
                    disabled={added}
                >
                    {added ? 'Added ReEval' : 'Add to ReEval'}
                </Button>
            )}
        </>
    );
};
