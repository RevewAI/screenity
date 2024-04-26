import React, { useEffect, useContext } from 'react';
import { contentStateContext } from './context/ContentState';
import { censor } from './popup/layout/RecordingType';
import Modal from './modal/Modal';

export const ReEvalRecord = () => {
    const [contentState, setContentState] = useContext(contentStateContext);

    useEffect(() => {
        // Event listener (extension messaging)
        const listener = async (request) => {
            const { type, options } = request;
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
        };
        chrome.runtime.onMessage.addListener(listener);

        return () => {
            chrome.runtime.onMessage.removeListener(listener);
        };
    }, []);
    return <>{/* <Modal /> */}</>;
};
