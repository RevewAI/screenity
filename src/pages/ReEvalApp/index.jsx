import React from 'react';
import { render } from 'react-dom';
import { RecoilRoot } from 'recoil';
import ReEvalApp from './ReEvalApp';

render(
    <RecoilRoot>
        <ReEvalApp />
    </RecoilRoot>,
    window.document.querySelector('#app-container')
);

if (module.hot) module.hot.accept();
