/**
 * 函数防抖动封装。
 * 函数防抖是一种优化策略，用于限制函数调用的频率，常用于输入事件的处理中，以减少不必要的计算或操作。
 * @param {Function} func 要被防抖的函数。
 * @param {number} wait 防抖时间，指函数调用后需要等待的时间。
 * @param {boolean} immediate 是否立即执行函数，当为true时，如果函数在等待时间之内被再次调用，则取消之前设置的延时。
 * @returns {Function} 返回一个封装后的函数，此函数具有防抖功能。
 */
export function debounce(func, wait, immediate) {
    let timeout;
    // 返回一个封装函数
    return function () {
        const context = this; // 函数执行的上下文
        const args = arguments; // 函数调用时的参数
        // 定义延时执行的函数
        const later = function later() {
            timeout = null;
            // 如果不是立即执行且没有超时，则执行原函数
            if (!immediate) func.apply(context, args);
        };
        // 判断是否立即执行原函数
        const callNow = immediate && !timeout;
        // 清除之前的延时设置
        clearTimeout(timeout);
        // 设置新的延时
        timeout = setTimeout(later, wait);
        // 如果设置为立即执行，则立即执行原函数
        if (callNow) func.apply(context, args);
    };
}

/**
 * 延迟
 */
export function sleep(delay) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

export const local = {
    get: async (key) => {
        const { [key]: value } = await chrome.storage.local.get(key);
        return value;
    },

    set: async (key, value) => {
        await chrome.storage.local.set({ [key]: value });
    },

    remove: async (key) => {
        await chrome.storage.local.remove(key);
    }
};

export const msg = {
    on: (type, func) => {
        const listener = (request, sender, sendResponse) => {
            if (request.type === type) {
                func?.(request.options, sender, sendResponse);
            }
        };
        chrome.runtime.onMessage.addListener(listener);
        return () => {
            chrome.runtime.onMessage.removeListener(listener);
        };
    },

    send: (type, options) => {
        chrome.runtime.sendMessage({ type, options });
    },

    tabSend: (tabId) => {
        return (type, options) => chrome.tabs.sendMessage(tabId, { type, options });
    }
};

export function stringifyWithCircular(obj) {
    const seen = new WeakSet();

    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]'; // 或者其他标记值
            } else {
                seen.add(value);
            }
        }
        return value;
    });
}

export function plainJSONParse(obj) {
    return JSON.parse(stringifyWithCircular(obj));
}

export async function compareState(state = {}) {
    const storage = await chrome.storage.local.get(null);
    const entites = Object.entries(storage).map(([key, value]) => {
        return [key, [value, state[key]]];
    });
    const compare = Object.fromEntries(entites);
    return { storage: plainJSONParse(storage), compare };
}
