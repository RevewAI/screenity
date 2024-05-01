import { Constants, MsgKey, StorageKey } from '../ReEvalApp/Constant';
import { getReEvalURL } from '../ReEvalApp/bus';
import { local, sleep } from '../ReEvalApp/utils';
import { createWindow, removeWindowDefaultTab } from './bus';
import { getCurrentTab } from './modules/tabHelper';

const listener = ({ type }) => {
    console.log('ooOoo--->>', 'ooooooooooooooo', type);
    if (type === 'stop-recording-tab') {
        console.log('ooOoo', 'ooooooooooooooo');
    }
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const { type, options } = request;

    /**
     * 初始化，打开storyboard关联的页面，准备录屏
     */
    if (type === 'reeval-storyboard') {
        const { storyboard } = options;
        const { sections } = storyboard;
        // 新建一个 window
        // const wind = await createWindow(chrome.windows.WindowState.FULLSCREEN);
        const win = await createWindow(chrome.windows.WindowState.FULLSCREEN);
        // 删除浏览器默认页面
        const tempLoaded = [];
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
                        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                            if (info.status === 'complete' && tabId === tab.id) {
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

        // 当前活动 active tab
        const activeTab = await getCurrentTab({ windowId: win.id });
        console.log(activeTab);
        // 当前activeTab
        await chrome.storage.local.set({ activeTab: activeTab.id });
        await chrome.tabs.sendMessage(activeTab.id, { type: 'reeval-start-recording', options });
    }

    /**
     * 读取 storyboard.recording 配置,
     * 执行脚本内容
     */
    // stop-recording-tab
    if (type === 'reeval-run-storyboard') {
        try {
            console.log('reeval-run-storyboard -->> ', options);
            // 等待倒计时3s
            await sleep(3000);
            const sections = options?.storyboard?.sections ?? [];
            console.log(':::---> sections', sections);
            for await (const config of sections) {
                chrome.runtime.onMessage.removeListener(listener);
                chrome.runtime.onMessage.addListener(listener);
                const { tabId, inx, screen_recording: record } = config;
                if (tabId) {
                    // 中断录屏 退出遍历
                    if (await local.get(StorageKey.INTERRUPT_RECORDING)) break;
                    // 激活tab
                    await chrome.tabs.update(tabId, { highlighted: true });
                    // 传递信息，通知runtime执行高亮文本
                    console.log(':::---> send', inx, record);
                    await chrome.tabs.sendMessage(tabId, { type: 'run-reeval', options: record });
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
            // 退出全屏
            const { id: windowId } = await chrome.windows.getCurrent();

            await chrome.windows.update(windowId, { state: chrome.windows.WindowState.MINIMIZED });
            setTimeout(async () => {
                await chrome.windows.update(windowId, { state: chrome.windows.WindowState.MAXIMIZED });
            }, 100);
        } catch (e) {
            console.log('reeval-run-storyboard', e);
        }
    }

    /**
     * 用户取消录屏
     * 视窗恢复
     */
    if (type === MsgKey.CANCEL_RECORDING) {
        const { id: windowId } = await chrome.windows.getCurrent();
        await chrome.windows.update(windowId, { state: chrome.windows.WindowState.MINIMIZED });
        setTimeout(async () => {
            await chrome.windows.update(windowId, { state: chrome.windows.WindowState.MAXIMIZED });
        }, 100);
    }

    /**
     * 用户中断录屏
     * 视窗恢复
     */
    if (type === MsgKey.INTERRUPT_RECORDING) {
        const { id: windowId } = await chrome.windows.getCurrent();
        await chrome.windows.update(windowId, { state: chrome.windows.WindowState.MINIMIZED });
        setTimeout(async () => {
            await chrome.windows.update(windowId, { state: chrome.windows.WindowState.MAXIMIZED });
        }, 100);
    }
});
