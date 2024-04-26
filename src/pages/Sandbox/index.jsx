import React from 'react';
import { render } from 'react-dom';

import Sandbox from './Sandbox';

import ContentState from './context/ContentState';
import { RecoilRoot } from 'recoil';

// Render at the end of the body of any website
render(
    <RecoilRoot>
        <ContentState>
            <Sandbox />
        </ContentState>
    </RecoilRoot>,
    window.document.querySelector('#app-container')
);

if (module.hot) module.hot.accept();
