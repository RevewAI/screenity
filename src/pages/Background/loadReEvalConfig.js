import $ from 'jquery';
import { delay, maxBy, minBy } from 'lodash-es';
import dayjs from 'dayjs';

const adjustOffestTop = 70;

/**
 * 获取时间 diff
 */
export function timeDiff(time) {
    return dayjs(`2024-04-01 ${time}`, 'YYYY-MM-DD HH:mm:ss.SSS');
}

/**
 * 延迟
 */
export function sleep(delay) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

/**
 * 页面滚动
 */
export function scrollTo(top) {
    $('html, body').animate({ scrollTop: top - adjustOffestTop }, 1000);
}

/**
 * 高亮文本
 */
export function highlintText(element, text, reg) {
    console.log('ooOoo--><->', element, text, reg);
    const text$ = text.replace(/\s+/g, '');
    const html = element.innerHTML;
    // 高亮文本，且写入mark标签，方便定位
    const regex = reg ? RegExp(reg) : new RegExp(`(${text})`, 'gi');
    // data-v 用于定位
    console.log('ooOo->', regex);
    const html$ = html.replace(regex, `<mark data-v="${text$}" style="background: rgb(255, 255, 0)">$1</mark>`);
    element.innerHTML = html$;
    return { markSelector: `[data-v="${text$}"]`, sourceHTML: html };
}

/**
 * 判断dom是否在浏览器可见
 * - display, visibility, opacity
 */
export function isElementVisible(element) {
    const style = window.getComputedStyle(element);
    let elementVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';

    let parent = element.parentNode;
    while (parent instanceof HTMLElement && elementVisible) {
        const parentStyle = getComputedStyle(parent);
        elementVisible = elementVisible && parentStyle.display !== 'none' && parentStyle.visibility !== 'hidden';
        parent = parent.parentNode;
    }

    return elementVisible;
}

/**
 * 查找包含文本的选择器
 * @param {*} selector 选择权范围
 * @param {*} text 匹配的文本或正则表达式
 * @param {*} precision 匹配精度
 * @returns
 */
export function contains(selector, text, precision) {
    var elements = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
    return [].filter.call(elements, function (element) {
        const textNode = element.childNodes[0];
        const isIgnore = !['SCRIPT', 'HTML'].includes(element.nodeName);
        const isVisible = isElementVisible(element);
        return (
            isIgnore &&
            isVisible &&
            (precision ? textNode?.nodeValue && RegExp(text).test(textNode.textContent) : RegExp(text).test(element.textContent))
        );
    });
}

/**
 * 模糊包含文本查找
 */
export function fuzzyContains(text) {
    if (!text) return [];
    const selector = document.querySelectorAll('*');
    // 第一次正常文本
    let reg = RegExp(`(${text})`);
    let rst = contains('*', reg, 1);
    if (rst.length) return [rst, reg, 1];
    rst = contains('*', reg, 0);
    if (rst.length) return [rst, reg, 0];
    if (typeof text === 'string') {
        // text = text.split('').filter(Boolean).map((char) => `${char}\n*`).join('');
        text = text.replace(/\s+/g, '\n*');
        reg = RegExp(`(${text})`);
        rst = contains(selector, reg, 1);
        if (rst.length) return [rst, reg, 1];
        rst = contains('*', reg, 0);
        if (rst.length) return [rst, reg, 0];
    }
    return [];
}

/**
 * 计算最近的包含文本的元素
 * // todo 非精度跨标签处理
 */
export function closestContainer(text) {
    console.log('closestContainer.0');
    const [elements, regex, precision] = fuzzyContains(text);
    console.log('closestContainer.1');
    if (!elements) return [];
    if (typeof precision === 'number') return [elements[0], regex, precision];
    return [];
}

/**
 * 页面滚动到条件指定位置
 */
export function scrollContent(text, position) {
    console.log('ooOoo.0~~>', text, position);
    if (!text) {
        scrollTo(position ?? 0);
        return {};
    }

    // 获取文本所在的元素
    const [element, regex, precision] = closestContainer(text);
    console.log('ooOoo.1~~>', text, element, regex, precision);
    if (!element) return {};
    // 高亮文本
    const { markSelector, sourceHTML } = highlintText(element, text, regex);
    // 获取高亮标签，滚动到高亮标签位置
    const matcher = $(element).find(markSelector);
    const position$matcher = matcher.offset();

    // 平滑滚动
    scrollTo(position$matcher.top);

    return { selector: element, markSelector, sourceHTML };
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

export function push(url) {
    return history.pushState('', '', url);
}

// 根据配置信息按顺序执行脚本，进行录屏
export async function autoScrollByScreenity(options) {
    // 获取配置信息
    const setting = await loadReEvalConfig(options);
    console.log('oOo.1->获取配置项', setting);
    // 没有配置信息退出
    if (!setting?.length) return;

    // 获取当前页面URL的ReEval索引
    const source = window.location.href;

    // 若索引值不匹配，则索引值默认为0
    let inx = getReEvalIndex(source) ?? 0;
    console.log('oOo.2->获取索引值', inx);

    // 当前索引下的配置信息
    const config = setting.at(inx);
    console.log('oOo.3->当前配置', config);

    // 获取目标URL
    const { target } = config;

    // 若当前页面URL与配置信息目标URL不匹配，则退出
    if (!compareURL(source, target)) {
        if (hasReEvalIndex) push(cleanReEvalURL(source));
        return;
    }

    const start = +new Date();
    do {
        console.log(`------------------${inx}-----------------------------`);
        const { target, source_content = '', position = 0, time_start, time_end } = setting[inx];
        const source = window.location.href;

        // 若URL不一致，则跳转
        console.log(':::.0->页面跳转->>', compareURL(source, target), source, target);
        if (!compareURL(source, target)) {
            console.log(':::.0.1->页面跳转', source, target);
            window.location.href = getReEvalURL(target, inx);
            return;
        }

        // 按Query.reeavl重写URL, 防止刷新
        push(getReEvalURL(target, inx));
        console.log(':::.1->重写URL', getReEvalURL(target, inx));

        // 滚动到脚本文本位置
        const { selector, sourceHTML } = scrollContent(source_content, position);
        console.log(':::.2->文本滚动', source_content);

        // 脚本执行等待
        await sleep(timeDiff(time_end).diff(timeDiff(time_start)));
        // 删除高亮, 写会源信息
        selector && sourceHTML && $(selector).html(sourceHTML);
        console.log(':::.3->移除高亮');
        inx++;
    } while (inx < setting.length);

    // 脚本执行结束，清空脚本信息
    chrome.storage.local.set({ 'reeval-script': [] });
    // 清楚Query.reeval参数
    push(cleanReEvalURL());
    console.log('oOo.100->clean');
}

export async function loadReEvalConfig(options) {
    let config = await chrome.storage.local.get(['reeval-script']);
    if (config) {
        // 去取脚本信息
        // @todo 从插件端读取脚本信息
        config = options;
        chrome.storage.local.set({ 'reeval-script': options });
    }
    return config;
}

/**
 * 执行ReEval脚本
 */
export async function runReEval(config) {
    const { source_content = '', position = 0, time_start, time_end } = config;
    // 滚动到脚本文本位置
    const { selector, sourceHTML } = scrollContent(source_content, position);
    // 脚本执行等待
    await sleep(timeDiff(time_end).diff(timeDiff(time_start)));
    // 删除高亮, 写回源信息
    selector && sourceHTML && $(selector).html(sourceHTML);
}
