import { uniq } from 'lodash-es';
import { Constants, MsgKey, StorageKey } from '../ReEvalApp/Constant';
import { cleanReEvalURL } from '../ReEvalApp/bus';
import { debounce, msg } from '../ReEvalApp/utils';
import { getCurrentTab, sendMessageTab } from './modules/tabHelper';
import { sendMessageRecord, stopRecording } from '.';

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
        appTab = await create({ url: app, windowId, index: 0, active: true, pinned: true });
    }

    // app已打开
    if (appTab) {
        // 从其他window移动到当前的window
        appTab.windowId !== windowId && (await move(appTab.id, { windowId, index: 0 }));

        // 激活
        await update(appTab.id, { highlighted: true, active: true, pinned: true });
    }

    // temp tab id
    await chrome.storage.local.set({ [StorageKey.APP_TAB_ID]: appTab.id });
});

// chrome.action.onClicked.addListener(async (tab) => {
//     // tab.id
//     // "recordingTab": null,

//     const a = await chrome.storage.local.get(null);
//     console.log('------------->><>o start', JSON.parse(JSON.stringify(a)));
//     console.log('------------->><>o start tab', tab);

//     // Check if recording
//     const { recording } = await chrome.storage.local.get(['recording']);

//     if (recording) {
//         stopRecording();
//         sendMessageRecord({ type: 'stop-recording-tab' });
//         const { activeTab } = await chrome.storage.local.get(['activeTab']);

//         // Check if actual tab
//         chrome.tabs.get(activeTab, (t) => {
//             if (t) {
//                 sendMessageTab(activeTab, { type: 'stop-recording-tab' });
//             } else {
//                 sendMessageTab(tab.id, { type: 'stop-recording-tab' });
//                 chrome.storage.local.set({ activeTab: tab.id });
//             }
//         });
//     } else {
//         // Check if it's possible to inject into content (not a chrome:// page, new tab, etc)
//         if (
//             !(
//                 (navigator.onLine === false && !tab.url.includes('/playground.html') && !tab.url.includes('/setup.html')) ||
//                 tab.url.startsWith('chrome://') ||
//                 (tab.url.startsWith('chrome-extension://') && !tab.url.includes('/playground.html') && !tab.url.includes('/setup.html'))
//             ) &&
//             !tab.url.includes('stackoverflow.com/') &&
//             !tab.url.includes('chrome.google.com/webstore') &&
//             !tab.url.includes('chromewebstore.google.com')
//         ) {
//             // await chrome.storage.local.set({
//             //     // 当前活跃的 activeTab
//             //     activeTab: tab.id,
//             //     // 在页面中载入 extension wrapper
//             //     showExtension: true,
//             //     // 不显示 popup
//             //     customRegion: false,
//             //     // pendingRecording: true,
//             //     showPopup: false,
//             //     recording: true,
//             //     pendingRecording: false
//             // });
//             // console.log('action click', tab);
//             // await sendMessageTab(tab.id, { type: MsgKey.REEVAL_PENDDING_STORYBOARD, options: {} });
//             /**
//              * ---><>
//              */
//             // await chrome.storage.local.set({
//             //     recordingType: 'screen',
//             //     // 录制未开始状态
//             //     recording: false,
//             //     // pendingRecording: true,
//             //     // 是否开启摄像头
//             //     cameraActive: false,
//             //     // 询问麦克风权限 by 插件
//             //     askMicrophone: false,
//             //     // 是否开启麦克
//             //     micActive: false,
//             //     // 倒计时
//             //     countdown: true,
//             //     // 麦克权限请求
//             //     // microphonePermission: false,
//             //     // 摄像头权限请求
//             //     // cameraPermission: false,
//             //     // 是否需要请求权限
//             //     askForPermissions: false,
//             //     firstTime: true,
//             //     // 隐藏工具条
//             //     hideToolbar: true,
//             //     // 是否显示UI，工具框
//             //     // hideUI: true,
//             //     hideUI: true,
//             //     // 是否显示UI提示框
//             //     hideUIAlerts: false,
//             //     toolbarHover: false
//             // });
//             const a = await chrome.storage.local.get(null);
//             await chrome.storage.local.remove(Object.keys(a));
//             sendMessageTab(tab.id, { type: 'toggle-popup', tab });
//             chrome.storage.local.set({ activeTab: tab.id });
//             // sendMessageTab(tab.id, { type: MsgKey.REEVAL_PENDDING_STORYBOARD });
//         } else {
//             chrome.tabs
//                 .create({
//                     url: 'playground.html',
//                     active: true
//                 })
//                 .then((tab) => {
//                     chrome.storage.local.set({ activeTab: tab.id });
//                 });
//         }
//     }

//     const { firstTime } = await chrome.storage.local.get(['firstTime']);
//     if (firstTime && tab.url.includes(chrome.runtime.getURL('setup.html'))) {
//         chrome.storage.local.set({ firstTime: false });
//         // Send message to active tab
//         const activeTab = await getCurrentTab();
//         sendMessageTab(activeTab.id, { type: 'setup-complete' });
//     }
// });

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
