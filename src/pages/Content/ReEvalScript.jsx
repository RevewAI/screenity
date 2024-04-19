import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { reevalStore } from './store';

export const options = [
    {
        target: 'https://zhuanlan.zhihu.com/p/687768524',
        voice_over_script:
            '在最新的GTC AI大会上，英伟达发布了其最新、也被宣称为最强大的AI芯片——GB200系列，旨在进一步巩固其在AI算力市场的领先地位。',
        position: 0,
        time_start: '00:00:00.000',
        time_end: '00:00:03.000'
        // time_end: '00:00:12.000'
    },
    {
        target: 'https://zhuanlan.zhihu.com/p/687768524',
        voice_over_script: '不过，尽管技术上的突破令人瞩目，市场和资本的反应却出乎意料地冷淡，这背后的原因值得深思。',
        source_content:
            '然而在英伟达CEO黄仁勋两个小时的演讲、介绍环节过后，英伟达原本仅微涨的股价，在盘后交易中跌幅一度扩大，不断在-1%的位置拉扯。',
        time_start: '00:00:03.000',
        time_end: '00:00:06.000'
    },
    {
        target: 'https://zhuanlan.zhihu.com/p/40548871',
        source_content: '在要修改的特征右键→编辑草图→重新附着→选择新的平面',
        time_start: '00:00:10.000',
        time_end: '00:00:16.000'
    },
    {
        target: 'https://doodles.google/',
        source_content:
            'The very first Doodle launched as an “out of office” message of sorts when company founders Larry and Sergey went on vacation',
        time_start: '00:00:06.000',
        time_end: '00:00:10.000'
    },
    {
        target: 'https://zhuanlan.zhihu.com/p/687768524',
        voice_over_script: '虽然GB200系列芯片在技术规格上远超前代，提供前所未有的计算能力，但资本市场的反应却相对保守。',
        source_content:
            'B200 拥有2080亿个晶体管，前一代H100、H200系列芯片只有800亿个。B200采用台积电4NP工艺制程，可以支持10万亿参数级的AI模型。',
        // "source_content": "B200采用台积电4NP工艺制程，可以支持10万亿参数级的AI模型。",
        time_start: '00:00:16.000',
        time_end: '00:00:20.000'
    },
    {
        target: 'https://zhuanlan.zhihu.com/p/687768524',
        voice_over_script:
            '英伟达的战略布局显示出其意图拓宽市场影响力，特别是通过与云服务巨头的合作，为中小企业提供更易于接入的AI算力服务。',
        source_content: '英伟达此次还与亚马逊、谷歌、微软以及Oracle等云服务巨头合作，未来将通过云服务的模式，出售GB200的接入权。',
        time_start: '00:00:20.000',
        time_end: '00:00:24.000'
    },
    {
        target: 'https://zhuanlan.zhihu.com/p/687768524',
        voice_over_script: '这一策略不仅有望扩大其客户基础，也意在通过软件和服务提升营收，体现了英伟达对“以软件卖硬件”模式的战略转型。',
        source_content: '软件服务方面，黄仁勋还重点介绍了AI软件订阅服务包，表明英伟达正在做出“以软件卖硬件”的新战略转型。',
        time_start: '00:00:24.000',
        time_end: '00:00:28.000'
    },
    {
        target: 'https://zhuanlan.zhihu.com/p/109784187',
        voice_over_script: '然而，这一战略的成功还需时间来证明其效果及对股价的长期影响。',
        source_content: '往复走刀的切削角度是与WCS坐标XC坐标轴的夹角还是MCS坐标XM坐标轴的夹角',
        time_start: '00:00:28.000',
        time_end: '00:00:32.000'
    },
    {
        target: 'https://zhuanlan.zhihu.com/p/687768524',
        voice_over_script: '然而，这一战略的成功还需时间来证明其效果及对股价的长期影响。',
        source_content: '英伟达股价在美股盘后交易中由涨转跌，最终跌幅还扩大至1.76%。',
        time_start: '00:00:32.000',
        time_end: '00:00:36.000'
    }
];

export const ReEvalScript = () => {
    const data = useRecoilValue(reevalStore);
    const runReEvalScript = () => {
        console.log('run reeval script');
        chrome.runtime.sendMessage({ type: 'reeval', options: options });
    };
    return (
        <div className="reeval-script">
            <textarea>{JSON.stringify(options, null, 2)}</textarea>
            <button className="main-button recording-button" onClick={runReEvalScript}>
                Run ReEval Script
            </button>
        </div>
    );
};
