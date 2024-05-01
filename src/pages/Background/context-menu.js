import { Constants, MenuContext, MsgKey, StorageKey } from '../ReEvalApp/Constant';
import { cleanReEvalURL } from '../ReEvalApp/bus';
import { local, msg } from '../ReEvalApp/utils';
import { updateActionCount } from './action';

export async function addToReEval(tab) {
    const pageUrl = tab.url;
    const { [StorageKey.PAGES]: pages } = await chrome.storage.local.get(StorageKey.PAGES);
    if (!pages.includes(pageUrl)) {
        await chrome.tabs.sendMessage(tab.id, { type: MsgKey.ADD_TO_REEVAL });
        const html = await fetch(pageUrl).then((res) => res.text());
        await fetch(`${Constants.RESOURCE_BASE}/pages`, {
            method: 'post',
            body: JSON.stringify({ url: pageUrl, title: tab.title, html_content: html })
        });

        // 通知 tab 更新成功
        await chrome.tabs.sendMessage(tab.id, { type: MsgKey.ADDED_TO_REEVAL });

        // 通知 app 更新数据
        const appTabId = await local.get(StorageKey.APP_TAB_ID);
        appTabId && (await chrome.tabs.sendMessage(appTabId, { type: MsgKey.APP_RELOAD, options: Math.random() }));

        // 更新Pages
        await updateActionCount(pageUrl);
    }
}

/**
 * 在右键菜单中添加项 Add to ReEval
 */
chrome.contextMenus.create({
    id: MenuContext.ADD,
    title: 'Add to ReEval',
    contexts: ['all'],
    documentUrlPatterns: ['http://*/*', 'https://*/*']
});

msg.on(MsgKey.IS_ADDED_REEVAL, async ({ added, url }) => {
    chrome.contextMenus.update(MenuContext.ADD, {
        title: added ? 'Added ReEval' : 'Add to ReEval',
        enabled: !added
    });
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;
    const url = cleanReEvalURL(tab.url);
    const pages = await local.get(StorageKey.PAGES);
    const added = pages?.includes?.(url);
    chrome.contextMenus.update(MenuContext.ADD, {
        title: added ? 'Added ReEval' : 'Add to ReEval',
        enabled: !added
    });

    if (added) {
        await chrome.action.setBadgeBackgroundColor({ color: Constants.ADDED_REEVAL_COLOR });
        await chrome.action.setBadgeTextColor({ color: '#fff' });
        await chrome.action.setIcon({ path: 'assets/recording-reeval.png' });
    } else {
        await chrome.action.setBadgeBackgroundColor({ color: Constants.NOT_ADDED_REEVAL_COLOR });
        await chrome.action.setIcon({ path: 'assets/icon-34.png' });
    }
});

/**
 * 右键添加按钮
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const { menuItemId } = info;
    if (menuItemId === MenuContext.ADD) {
        await addToReEval(tab);
    }
});

/**
 * 在页面上点击 PageAction 添加页面
 */
chrome.runtime.onMessage.addListener(async (request, { tab }, sendMessage) => {
    if (request.type === StorageKey.ADD_TO_REEVAL) {
        await addToReEval(tab);
    }
});
