import { sleep } from '../ReEvalApp/utils';

/**
 * 创建窗口
 */
export async function createWindow(state = chrome.windows.WindowState.NORMAL) {
    // FULLSCREEN: 'fullscreen';
    // LOCKED_FULLSCREEN: 'locked-fullscreen';
    // MAXIMIZED: 'maximized';
    // MINIMIZED: 'minimized';
    // NORMAL: 'normal';

    // windows create state 设置没有作用，需要用 window.update 修改
    const wind = await chrome.windows.create({});
    chrome.windows.update(wind.id, { state: state ?? chrome.windows.WindowState.FULLSCREEN });
    return wind;
}

/**
 * 删除窗口默认的tab或插件指定的默认tab
 */
export async function removeWindowDefaultTab(windowId) {
    await sleep(300);
    const tabs = await chrome.tabs.query({ windowId });
    const tabs$ = tabs.filter(({ url, pendingUrl }) => {
        return ['', 'chrome://newtab/', 'chrome://newtab'].includes(url || pendingUrl);
    });
    for await (const tab of tabs$) {
        const { id: tabId } = (await chrome.tabs.get(tab.id)) ?? {};
        if (tabId) {
            await chrome.tabs.remove(tabId);
        }
    }
}
