import { Constants, DownloadType, MsgKey, StorageKey } from './Constant';
import { local, msg } from './utils';

/**
 * 生成指定模块和ID的媒体资源源URL
 * @param {string} module - 模块名称，对应下载类型枚举
 * @param {number|string} id - 资源的唯一标识符
 * @returns {string} 返回构造的媒体资源下载URL
 */
export function getMediaSourceURL(module, id) {
    // 尝试从DownloadType枚举中获取模块对应的类型，如果未定义则直接使用模块名称
    const type = DownloadType[module] ?? module;
    // 构造并返回资源的完整下载URL
    return `${Constants.RESOURCE_BASE}/download/${type}/${id}`;
}

// 对比URL
// ReEval 的URL会添加Query.reeval=number，需要去除进行比较
export function compareURL(source, target) {
    return cleanReEvalURL(source) === cleanReEvalURL(target);
}

// 修改URL
// 添加URL Query.reeval=number参数
export function getReEvalURL(url, inx) {
    const entity = new URL(url);
    entity.searchParams.set('reeval', inx);
    return entity.toString();
}

// 清理URL
// 清理URL上Query.reeval的标志
export function cleanReEvalURL(url) {
    const entity = new URL(url ?? window.location.href);
    entity.searchParams.delete('reeval');
    return entity.toString();
}

// 获取URL上的ReEval索引
export function getReEvalIndex(url) {
    const entity = new URL(url ?? window.location.href);
    return entity.searchParams.get('reeval');
}

// 判断是否有URL上的ReEval索引
export function hasReEvalIndex(url) {
    const entity = new URL(url ?? window.location.href);
    return entity.searchParams.has('reeval');
}

export async function sendMessageToApp(type, options) {
    const appTabId = await local.get(StorageKey.APP_TAB_ID);
    if (appTabId) {
        const sendMessage = msg.tabSend(appTabId);
        await sendMessage(type, options);
    }
}
