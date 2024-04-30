import React, { useEffect, useContext, useState } from 'react';
import { contentStateContext } from './context/ContentState';
import { MsgKey, StorageKey } from '../ReEvalApp/Constant';
import { Button } from 'antd';
import { PlusOutlined, CheckOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { cleanReEvalURL } from '../ReEvalApp/bus';

export const ReEvalRecord = () => {
    const [contentState, setContentState] = useContext(contentStateContext);
    const [addReEvalLoading, setAddReEvalLoading] = useState(false);
    const [pageAction, setPageAction] = useState(false);
    const [added, setAdded] = useState(false);

    // Event listener (extension messaging)
    const messageListener = async (request) => {
        const { type, options } = request;
        console.log('::->', type);
        // 发出录屏申请
        if (type === 'reeval-start-recording') {
            const state = {
                recording: true,
                // 倒计时
                countdown: true,
                // 录制类型
                // screen: 屏幕区域
                // region: 标签区域
                // camera: 摄像头
                // mock: 模拟(移动端)
                recordingType: 'screen',
                // 设置区域
                customRegion: false,
                // 关闭麦克风
                microphonePermission: false,
                askMicrophone: false,
                // 关闭摄像头
                cameraPermission: false
            };
            setContentState((prevState) => {
                return { ...prevState, ...state };
            });
            await chrome.storage.local.set({ ReEvalProductionOption: options });
            await contentState.startStreaming();
        }

        if (type === MsgKey.ADD_TO_REEVAL) {
            // loading 状态
            setAddReEvalLoading(true);
        }

        if (type === MsgKey.ADDED_TO_REEVAL) {
            console.log('::-> 2', type);
            // susscess
            setAddReEvalLoading(false);
            setAdded(true);
        }
    };

    const storageListener = (changes, areaName) => {
        console.log('----------->>>', changes, changes[StorageKey.PAGE_ACTION_BAR]);
        if (areaName === 'local' && changes[StorageKey.PAGE_ACTION_BAR]) {
            setPageAction(changes[StorageKey.PAGE_ACTION_BAR]?.newValue);
        }

        if (areaName === 'local' && changes[StorageKey.PAGES]) {
            const pages = changes[StorageKey.PAGES]?.newValue ?? [];
            const isAdded = pages.includes(cleanReEvalURL(window.location.href));
            setAdded(isAdded);
        }
    };

    const addToReEval = () => {
        setAddReEvalLoading(true);
        chrome.runtime.sendMessage({ type: StorageKey.ADD_TO_REEVAL });
    };

    useEffect(() => {
        chrome.runtime.sendMessage({ type: MsgKey.IS_ADDED_REEVAL, options: { added, url: cleanReEvalURL() } });
    }, [added]);

    useEffect(() => {
        console.log('runtime storage');
        chrome.runtime.onMessage.addListener(messageListener);
        chrome.storage.onChanged.addListener(storageListener);
        chrome.storage.local
            .get([StorageKey.PAGE_ACTION_BAR, StorageKey.PAGES])
            .then(({ [StorageKey.PAGE_ACTION_BAR]: checked, [StorageKey.PAGES]: pages = [] }) => {
                const isAdded = pages.includes(cleanReEvalURL(window.location.href));
                setAdded(isAdded);
                setPageAction(checked);
            });
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
            chrome.storage.onChanged.removeListener(storageListener);
        };
    }, []);
    return (
        <>
            {(pageAction || addReEvalLoading) && (
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
