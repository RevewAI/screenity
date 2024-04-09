import React from 'react';
import { render } from 'react-dom';
import Content from './Content';
import $ from 'jquery';
import { delay, maxBy, minBy } from 'lodash-es';
import dayjs from 'dayjs';

// Check if screenity-ui already exists, if so, remove it
const existingRoot = document.getElementById('screenity-ui');
if (existingRoot) {
    document.body.removeChild(existingRoot);
}

const root = document.createElement('div');
root.id = 'screenity-ui';
document.body.appendChild(root);
render(<Content />, root);

// - 每段对应一段录屏，有起止时间
// - position 为网页纵向滚动位置，单位为像素，用于定位录屏位置（和 source_content二选一）
// - source_content 为原文内容，用于定位录屏位置，定位到这个位置后，高亮显示这段文本（和 position二选一）
// - 段落间滚动要平滑，不要一下子跳到下一段

const options = [
    {
        voice_over_script:
            '在最新的GTC AI大会上，英伟达发布了其最新、也被宣称为最强大的AI芯片——GB200系列，旨在进一步巩固其在AI算力市场的领先地位。',
        position: 0,
        time_start: '00:00:00.000',
        // "time_end": "00:00:01.000"
        time_end: '00:00:12.000'
    },
    {
        voice_over_script: '不过，尽管技术上的突破令人瞩目，市场和资本的反应却出乎意料地冷淡，这背后的原因值得深思。',
        source_content:
            '然而在英伟达CEO黄仁勋两个小时的演讲、介绍环节过后，英伟达原本仅微涨的股价，在盘后交易中跌幅一度扩大，不断在-1%的位置拉扯。',
        time_start: '00:00:12.000',
        time_end: '00:00:16.000'
    },
    {
        voice_over_script: '虽然GB200系列芯片在技术规格上远超前代，提供前所未有的计算能力，但资本市场的反应却相对保守。',
        source_content:
            'B200 拥有2080亿个晶体管，前一代H100、H200系列芯片只有800亿个。B200采用台积电4NP工艺制程，可以支持10万亿参数级的AI模型。',
        // "source_content": "B200采用台积电4NP工艺制程，可以支持10万亿参数级的AI模型。",
        time_start: '00:00:16.000',
        time_end: '00:00:24.000'
    },
    {
        voice_over_script:
            '英伟达的战略布局显示出其意图拓宽市场影响力，特别是通过与云服务巨头的合作，为中小企业提供更易于接入的AI算力服务。',
        source_content: '英伟达此次还与亚马逊、谷歌、微软以及Oracle等云服务巨头合作，未来将通过云服务的模式，出售GB200的接入权。',
        time_start: '00:00:24.000',
        time_end: '00:00:32.000'
    },
    {
        voice_over_script: '这一策略不仅有望扩大其客户基础，也意在通过软件和服务提升营收，体现了英伟达对“以软件卖硬件”模式的战略转型。',
        source_content: '软件服务方面，黄仁勋还重点介绍了AI软件订阅服务包，表明英伟达正在做出“以软件卖硬件”的新战略转型。',
        time_start: '00:00:32.000',
        time_end: '00:00:40.000'
    },
    {
        voice_over_script: '然而，这一战略的成功还需时间来证明其效果及对股价的长期影响。',
        source_content: '英伟达股价在美股盘后交易中由涨转跌，最终跌幅还扩大至1.76%。',
        time_start: '00:00:40.000',
        time_end: '00:00:44.000'
    }
];

// function contains(text, jDom = $('body')) {
//   let texts$ = jDom.find(`:contains('${text}')`).toArray();
//   const matcher$ = texts$.map((element) => {
//     const $element = $(element);
//     const content = $element.text();
//     const inx = content.indexOf(text);
//     return { inx, element: $element };
//   });
//   const matcher$0 = minBy(matcher$, 'inx');
//   if(!matcher$0) return void 0;
//   const {element: closest$} = matcher$0;
//   return closest$;
// }

/**
 * 兼容适配节点计算
 * 若直接使用contains匹配不到文本
 * 则应该是以下现象
 * - 文本中有换行符/制表符等
 * - 文本是跨Tag标签
 * 该方法兼容计算可能性的节点
 */
// function compatibleAdaptation(text) {
//   const length = text.length;
//   let matcher$1, matcher$2;
//   for(let i = 0; i < length; i++) {
//     const text$ = text.split('').slice(i, length).join('');
//     const matcher$ = contains(text$);
//     if(matcher$){
//       matcher$1 = { element: matcher$, text: text$, inx: i, len: text$.length };
//       break;
//     }
//   }

//   for(let i = 0; i < length; i++) {
//     const text$ = text.split('').slice(0, length - i).join('');
//     const matcher$ = contains(text$);
//     if(matcher$){
//       matcher$2 = { element: matcher$, text: text$, inx: i, len: text$.length };
//       break;
//     }
//   }

//   console.log('oo-><>', matcher$1, matcher$2, !(matcher$1 || matcher$2));

//   if(!(matcher$1 || matcher$2)) return;

//   const matcher = maxBy([matcher$1, matcher$2], 'len')

//   const { len, inx, element } = matcher;

//   const half1 = text.split('').slice(0, inx).join('').trim();
//   const half2 = text.split('').slice(inx, Infinity).join('').trim();

//   const regexp = new RegExp(`(${half1}((.|\\s)*)${half2})`, 'gm');
//   const html = element.html();
//   const html$ = html.replace(regexp, `<mark data-v="${text}" style="background: rgb(255, 255, 0)">$2</mark>`);
//   console.log(regexp, html$);
//   element.html(html$);
// }

// function scrollNode (text, position) {
//   console.log(':::::-->', text);
//   if(!text) return scrollTo(position ?? 0);

//   // const text = '然而在英伟达CEO黄仁勋两个小时的演讲、介绍环节过后，英伟达原本仅微涨的股价，在盘后交易中跌幅一度扩大，不断在-1%的位置拉扯'
//   // const text = '从英伟达的财报不难看出，其非常依赖大客户的持续采购';
//   // const text = '抢走了不少思科的市场份额';
//   let texts$ = $(`:contains('${text}')`).toArray();

//   if(!texts$.length) {
//      console.log('compatibleAdaptation begin', texts$.length, text);
//      compatibleAdaptation(text);
//   }

//   const matcher$ = texts$.map((element) => {
//     const $element = $(element);
//     const content = $element.text();
//     const inx = content.indexOf(text);
//     return { inx, element: $element };
//   });

//   // 规则计算，匹配最有可能的
//   const matcher$0 = minBy(matcher$, 'inx');
//   if(!matcher$0) return void 0;
//   const {element: closest$} = matcher$0;

//   highlintText(closest$, text);

//   // 计算mark的位置，滚动位置
//   const matcher = closest$.find(`[data-v="${text}"]`)
//   const position$matcher = matcher.offset();

//   // 平滑滚动
//   scrollTo(position$matcher.top);

// }

// const start = +new Date();

// for(const item of options) {
//   const { voice_over_script, source_content = '', position = 0, time_start, time_end } = item;
//   scrollNode(source_content, position);
//   console.log(+new Date() - start,  source_content, getDate(time_end).diff(getDate(time_start)));
//   await sleep(getDate(time_end).diff(getDate(time_start)));
// }

/**
 * 根据文本获取它所在DOM的最接近元素
 * - 若文本匹配到DOM
 * --> contents().length === 1, indexOf 最小值
 * - 若没有匹配到DOM
 * --> 按文本长度节流计算，左右首尾匹配，向上查询文本
 */
// function containsClosest(text)  {
//   if(!text) return;
//   // 按文本匹配
//   const selector = `:contains('${text}')`;
//   const nodes = $(selector).toArray();
//   const regex = /<(.*)?>/g;

//   console.log(selector, nodes);

//   // 若文本匹配到DOM
//   if(nodes.length) {
//     const nodes$only = nodes.filter((item) => {
//       const content = $(item).html();
//       return $(item).contents().length === 1 && content.length < 1500  && !regex.test(content);
//     });

//     const nodes$inx = nodes$only.map((element) => {
//       const $element = $(element);
//       const content = $element.text();
//       const inx = content.indexOf(text);
//       return { inx, element };
//     }).filter(({ inx }) => {
//       return inx > -1;
//     });

//     console.log({nodes$only, nodes$inx});

//     if(nodes$inx.length) {
//       return minBy(nodes$inx, 'inx').element;
//     }

//     return;

//   }

//   const length = text.length;
//   let matchText1, matchText2;
//   for(let i = 0; i < length; i++) {
//     const text$ = text.split('').slice(i, length).join('');
//     if($(`:contains('${text$}')`).length){
//       matchText1 = text$
//       break;
//     }
//   }

//   for(let i = 0; i < length; i++) {
//     const text$ = text.split('').slice(0, length - i).join('');
//     if($(`:contains('${text$}')`).length){
//       matchText2 = text$
//       break;
//     }
//   }

//   const matcheText  = maxBy([matchText1, matchText2], 'length')

//   let element = containsClosest(matcheText);

//   if(!element) return;

//   while(element.innerText.replace(/\s/gi, '').indexOf(text.replace(/\s/gi, '')) === -1) {
//     const parent = element?.parentNode;
//     if(parent === document) return;
//     element = parent;
//   }

//   return element;
// }

// const element1 = containsClosest('B200 拥有2080亿个晶体管，前一代H100、H200系列芯片只有800亿个。B200采用台积电4NP工艺制程，可以支持10万亿参数级的AI模型。');
// console.log('ooOoo', element1);

// const element2 = containsClosest('科技圈的期待值被拉满。有媒体甚至直言，随着AI的爆火');
// console.log('ooOoo', element2);

const adjustOffestTop = 70;

function getDate(time) {
    return dayjs(`2024-04-01 ${time}`, 'YYYY-MM-DD HH:mm:ss.SSS');
}

function sleep(delay) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

function scrollTo(top) {
    $('html, body').animate(
        {
            scrollTop: top - adjustOffestTop
        },
        1000
    );
}

function highlintText(element, text, reg) {
    const text$ = text.replace(/\s+/g, '');
    const html = element.innerHTML;
    // 高亮文本，且写入mark标签，方便定位
    const regex = reg ? RegExp(reg) : new RegExp(`(${text})`, 'gi');
    // data-v 用于定位
    console.log('ooOo->', regex);
    const html$ = html.replace(regex, `<mark data-v="${text$}" style="background: rgb(255, 255, 0)">$1</mark>`);
    element.innerHTML = html$;
    return { markSelector: `[data-v="${text$}"]`, source: html };
}

/**
 * 判断dom是否在浏览器可见
 * - display, visibility, opacity
 */
function isElementVisible(element) {
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
function contains(selector, text, precision) {
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
function fuzzyContains(text) {
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
function closestContainer(text) {
    const [elements, regex, precision] = fuzzyContains(text);
    if (!elements) return [];
    if (precision) return [elements[0], regex, precision];
}

/**
 * 页面滚动到条件指定位置
 */
function scrollContent(text, position) {
    if (!text) {
        scrollTo(position ?? 0);
        return {};
    }

    // 获取文本所在的元素
    const [element, regex, precision] = closestContainer(text);
    // 高亮文本
    const { markSelector, source } = highlintText(element, text, regex);
    // 获取高亮标签，滚动到高亮标签位置
    const matcher = $(element).find(markSelector);
    const position$matcher = matcher.offset();

    // 平滑滚动
    scrollTo(position$matcher.top);

    return { selector: element, markSelector, source };
}

async function autoScrollByScreenity(options) {
    const start = +new Date();

    for (const item of options) {
        const { voice_over_script, source_content = '', position = 0, time_start, time_end } = item;
        // 滚动到脚本位置
        const { selector, source } = scrollContent(source_content, position);
        console.log(+new Date() - start, source_content, getDate(time_end).diff(getDate(time_start)));
        // 脚本执行等待
        await sleep(getDate(time_end).diff(getDate(time_start)));
        // 删除高亮
        selector && source && $(selector).html(source);
    }
}
