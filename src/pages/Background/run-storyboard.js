import { Constants, MsgKey, StorageKey } from '../ReEvalApp/Constant';
import { getReEvalURL } from '../ReEvalApp/bus';
import { local, sleep } from '../ReEvalApp/utils';
import { createWindow, removeWindowDefaultTab } from './bus';
import { getCurrentTab, sendMessageTab } from './modules/tabHelper';

async function openStoryboardTabs(sections) {
    // 新建一个 window
    // const wind = await createWindow(chrome.windows.WindowState.FULLSCREEN);
    const pendding = StorageKey.PENDDING_SCREEN;
    const win = await createWindow(chrome.windows.WindowState.MAXIMIZED);
    const tempLoaded = [];
    const total = Object.entries(sections).filter(([inx, config]) => !!config?.screen_recording?.url).length;
    await chrome.storage.local.set({ [pendding]: { run: true, total, loaded: 0 } });
    for await (const [inx, config] of Object.entries(sections)) {
        const url = config?.screen_recording?.url;
        config.inx = inx;

        // 片头没有url
        if (url) {
            const url$ = getReEvalURL(url, inx);
            // 创建 Tab, 默认激活第一个tab
            const tab = await chrome.tabs.create({ url: url$, active: !inx, windowId: win.id });
            // Tab信息写入sections
            config.tabId = tab.id;
            config.url = url$;
            // 等待页面加载结束
            tempLoaded.push(
                new Promise((resolve) => {
                    // 监听页面加载状态
                    chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
                        if (info.status === 'complete' && tabId === tab.id) {
                            const {
                                [pendding]: { total, loaded, run }
                            } = await chrome.storage.local.get(pendding);
                            await chrome.storage.local.set({ [pendding]: { run, total, loaded: loaded + 1 } });
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve(true);
                        }
                    });
                })
            );
        }
    }

    // 删除默认Tab
    tempLoaded.push(removeWindowDefaultTab(win.id));

    // 等待所有Tab加载完成
    await Promise.all(tempLoaded);
    await chrome.storage.local.set({ [pendding]: { run: true, total, loaded: total } });
    await sleep(300);
    await chrome.storage.local.set({ [pendding]: { run: false } });

    return { windowId: win.id };
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const { type, options } = request;

    /**
     * 初始化，打开storyboard关联的页面，准备录屏
     */
    if (type === 'reeval-storyboard') {
        const { storyboard } = options;
        const { sections } = storyboard;

        // 清除相关缓存
        const stores = await chrome.storage.local.get(null);
        await chrome.storage.local.remove(Object.keys(stores));

        // 设置 Screentify Popup 所需要的状态
        const state = {
            askForPermissions: false,
            askMicrophone: false,
            backgroundEffect: 'blur',
            backup: false,
            backupSetup: false,
            cameraActive: false,
            cameraPermission: false,
            countdown: true,
            firstTime: true,
            hideToolbar: true,
            hideUI: true,
            micActive: false,
            microphonePermission: false,
            // pendingRecording: true,
            recording: false,
            restarting: false,
            recordingType: 'screen',
            showExtension: true,
            showPopup: false
        };

        // 状态设定初始化
        await chrome.storage.local.set(state);

        // 打开tabs
        const { windowId } = await openStoryboardTabs(sections);

        // 当前活动 active tab
        const [activeTab] = await chrome.tabs.query({ windowId, active: true });

        // 存储信息
        await chrome.storage.local.set({ activeTab: activeTab.id, ReEvalProductionOption: options });

        // 记录 reeval 状态
        await chrome.storage.local.set({ [StorageKey.REEVAL_STATE]: true });
        await chrome.storage.local.set({ [StorageKey.REEVAL_WINDOW_ID]: windowId });

        // 最大化屏幕，准备录制
        await chrome.windows.update(windowId, { state: chrome.windows.WindowState.FULLSCREEN });

        // 状态更新
        await chrome.tabs.sendMessage(activeTab.id, { type: MsgKey.REEVAL_PENDDING_STATE, options: state });

        await sleep(500);

        // 通知页面，准备录制
        await chrome.tabs.sendMessage(activeTab.id, { type: MsgKey.REEVAL_PENDDING_STORYBOARD, options });
    }

    /**
     * 读取 storyboard.recording 配置,
     * 执行脚本内容
     */
    // stop-recording-tab
    if (type === MsgKey.REEVAL_RUN_STORYBOARD) {
        if (!Object.keys(options).length) return;
        try {
            // 等待倒计时3s
            await sleep(3000);
            const sections = options?.storyboard?.sections ?? [];
            for await (const config of sections) {
                const { tabId, inx, screen_recording: record } = config;
                if (tabId) {
                    // 中断录屏 退出遍历
                    if (await local.get(StorageKey.INTERRUPT_RECORDING)) break;
                    // 激活tab
                    await chrome.tabs.update(tabId, { highlighted: true });
                    // 传递信息，通知runtime执行高亮文本
                    await chrome.tabs.sendMessage(tabId, { type: MsgKey.REEVAL_RUN_SECTION, options: record });
                    // 等待时间
                    const duration = record?.duration ?? Constants.DURATION;
                    await sleep(duration);
                    // 等待后再验证中断
                    if (await local.get(StorageKey.INTERRUPT_RECORDING)) break;
                    // 取消激活tab
                    await chrome.tabs.update(tabId, { highlighted: false });
                }
            }
            // 停止录屏
            await chrome.runtime.sendMessage({ type: 'stop-recording-tab' });
            await local.set(StorageKey.INTERRUPT_RECORDING, false);
            const { id: windowId } = await chrome.windows.getCurrent();
            await chrome.windows.update(windowId, { state: chrome.windows.WindowState.MAXIMIZED });
            await chrome.storage.local.set({ recording: false, pendingRecording: false });
            await chrome.storage.local.set({ [StorageKey.REEVAL_STATE]: false });
            await chrome.storage.local.remove(StorageKey.REEVAL_WINDOW_ID);
        } catch (e) {
            await chrome.runtime.sendMessage({ type: 'stop-recording-tab' });
            await chrome.storage.local.set({ recording: false, pendingRecording: false });
            await chrome.storage.local.set({ [StorageKey.REEVAL_STATE]: false });
            await chrome.storage.local.remove(StorageKey.REEVAL_WINDOW_ID);
        }
    }

    /**
     * 用户取消录屏
     * 视窗恢复
     */
    if (type === MsgKey.CANCEL_RECORDING) {
        const { id: windowId } = await chrome.windows.getCurrent();
        await chrome.windows.update(windowId, { state: chrome.windows.WindowState.MAXIMIZED });
        await chrome.storage.local.set({ recording: false, pendingRecording: false });
        await chrome.storage.local.set({ [StorageKey.REEVAL_STATE]: false });
        await chrome.storage.local.remove(StorageKey.REEVAL_WINDOW_ID);
    }

    /**
     * 用户中断录屏
     * 视窗恢复
     */
    if (type === MsgKey.INTERRUPT_RECORDING) {
        const { id: windowId } = await chrome.windows.getCurrent();
        await chrome.windows.update(windowId, { state: chrome.windows.WindowState.MAXIMIZED });
        await chrome.storage.local.set({ recording: false, pendingRecording: false });
        await chrome.storage.local.set({ [StorageKey.REEVAL_STATE]: false });
        await chrome.storage.local.remove(StorageKey.REEVAL_WINDOW_ID);
    }
});
