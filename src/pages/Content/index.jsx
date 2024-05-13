import React from 'react';
import { RecoilRoot } from 'recoil';
import { render } from 'react-dom';
import Content from './Content';
import { runReEval } from '../Background/loadReEvalConfig';
import { local, msg } from '../ReEvalApp/utils';
import { MsgKey, StorageKey } from '../ReEvalApp/Constant';

// Check if screenity-ui already exists, if so, remove it
const existingRoot = document.getElementById('screenity-ui');
if (existingRoot) {
    document.body.removeChild(existingRoot);
}

const root = document.createElement('div');
root.id = 'screenity-ui';
document.body.appendChild(root);
render(
    <RecoilRoot>
        <Content />
    </RecoilRoot>,
    root
);

// 执行高亮文本
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const { type, options } = request;
    if (type === MsgKey.REEVAL_RUN_SECTION) {
        await runReEval(options);
    }

    if (type === 'stop-recording-tab') {
        await local.set(StorageKey.INTERRUPT_RECORDING, true);
        await msg.send(MsgKey.INTERRUPT_RECORDING);
    }
});

/**
 * 页面加载结束
 */
// $(document).ready(function () {
//     // 在这里写你的代码...
// });
