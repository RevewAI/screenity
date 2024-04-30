import { uniq } from 'lodash-es';
import { Constants, MsgKey, StorageKey } from '../ReEvalApp/Constant';
import { cleanReEvalURL } from '../ReEvalApp/bus';
import { debounce, msg } from '../ReEvalApp/utils';

/**
 * 点击 toolbar action icon, 打开 reevalapp
 * - reevalapp 始终在当前window的第一项
 * - 若 reevalapp 在其他 window 下，移动到当前的window下
 */
chrome.action.onClicked.addListener(async (tab) => {
    const { id, windowId } = tab;
    const app = chrome.runtime.getURL('reevalapp.html');
    const { create, update, move } = chrome.tabs;
    // 查询 app 是否打开
    let [appTab] = await chrome.tabs.query({ url: app });

    // app不曾打开, 创建reeval app
    if (!appTab) {
        appTab = await create({ url: app, windowId, index: 0, active: true });
    }

    // app已打开
    if (appTab) {
        // 从其他window移动到当前的window
        appTab.windowId !== windowId && (await move(appTab.id, { windowId, index: 0 }));

        // 激活
        await update(appTab.id, { highlighted: true, active: true });
    }

    // temp tab id
    await chrome.storage.local.set({ [StorageKey.APP_TAB_ID]: appTab.id });
});

/**
 * 更新chrome.action.setBadgeText
 */
chrome.runtime.onMessage.addListener(async (request) => {
    const { type, options } = request;
    if (type === MsgKey.UPDATE_ACTION_COUNT) {
        await chrome.action.setBadgeText({ text: String(options?.length) });
        await chrome.storage.local.set({ [StorageKey.PAGES]: options });
    }
});

/**
 * 关闭 app, 清理 temp
 */
chrome.tabs.onRemoved.addListener(async (tabId) => {
    const key = StorageKey.APP_TAB_ID;
    const { [key]: tabId$ } = await chrome.storage.local.get(key);
    tabId === tabId$ && (await chrome.storage.local.remove(key));
});

/**
 * 快速添加 toolbar action count
 */
export const quickUpdateActionCount = async (url) => {
    const { [StorageKey.PAGES]: pages } = await chrome.storage.local.get(StorageKey.PAGES);
    const pages$ = uniq([...(pages ?? []), cleanReEvalURL(url)]);
    await chrome.storage.local.set({ [StorageKey.PAGES]: pages$ });
    await chrome.action.setBadgeText({ text: String(pages$.length) });
};

/**
 * 更新 toolbar action count
 */
export const updateActionCount = async (url) => {
    url && (await quickUpdateActionCount(url));
    const response = await fetch(`${Constants.RESOURCE_BASE}/pages`);
    const { data } = await response.json();
    const count = data?.length;
    if (count) {
        await chrome.action.setBadgeText({ text: String(count) });
        await chrome.action.setBadgeBackgroundColor({ color: Constants.NOT_ADDED_REEVAL_COLOR });
        await chrome.storage.local.set({ [StorageKey.PAGES]: data.map(({ url }) => cleanReEvalURL(url)) });
    }
};

const updateActionCountDebounce = debounce(updateActionCount, 300);

updateActionCountDebounce();
