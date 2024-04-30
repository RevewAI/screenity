import React from 'react';
import { RecoilRoot } from 'recoil';
import { render } from 'react-dom';
import Content from './Content';

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

// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//     const { type, options } = request;
//     if (type === 'run-reeval') {
//         await runReEval(options);
//     }
// });
/**
 * 页面加载结束
 */
// $(document).ready(function () {
//     // 在这里写你的代码...
// });
