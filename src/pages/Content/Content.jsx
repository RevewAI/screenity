import React, { Suspense, useEffect, useState } from 'react';

// Components
import Wrapper from './Wrapper';
import { message } from 'antd';

// Context
import ContentState from './context/ContentState';
import { cleanReEvalURL } from '../Background/loadReEvalConfig';
import { Store, pagesStore, usePostPages, baseStore } from './store';
import $ from 'jquery';
import { useRecoilRefresher_UNSTABLE, useRecoilValueLoadable, useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import { ReEvalModal } from './ReEvalModal';
import { ReEvalRecord } from './ReEvalRecord';

const ReEvalBtn = () => {
    const postPage = usePostPages();
    const setOpenModal = useSetRecoilState(baseStore(Store.OPEN_PAGES_MODAL));
    const res = useRecoilValue(pagesStore);
    const refresh = useRecoilRefresher_UNSTABLE(pagesStore);
    const exist = res.data.find(({ url }) => {
        return url === cleanReEvalURL(window.location.href);
    });

    const markURL = async () => {
        try {
            // const { [storageKey]: urls = [] } = await chrome.storage.local.get([storageKey]);
            // // 不需要去重，一个页面可能出现多次
            // const urls$ = [...urls, window.location.href].map(cleanReEvalURL).filter(Boolean);
            // await chrome.storage.local.set({ [storageKey]: urls$ });
            // setCount(urls$.length);
            await postPage({
                url: cleanReEvalURL(window.location.href),
                title: document.title,
                html_content: $('html').html()
            });
            refresh();
            message.success('Add ReEval Success');
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <>
            {exist ? (
                <section className="reeval-ball reeval-ball-added" onClick={() => setOpenModal(true)}>
                    ReEval Added
                </section>
            ) : (
                <section className="reeval-ball" onClick={markURL}>
                    + ReEval
                </section>
            )}
        </>
    );
};

const Content = () => {
    const storageKey = 'reeval-urls';
    const [count, setCount] = useState(0);
    const [openModal, setOpenModal] = useRecoilState(baseStore(Store.OPEN_PAGES_MODAL));
    const { contents: pages } = useRecoilValueLoadable(pagesStore);
    const [reevalMark, setReEvalMark] = useState();

    useEffect(() => {
        chrome.storage.local.get([storageKey]).then(({ [storageKey]: urls }) => {
            setCount(urls?.length ?? 0);
        });

        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'local') {
                const { newValue = [] } = changes?.[storageKey] ?? {};
                setCount(newValue?.length);
            }
        });
    }, []);

    useEffect(() => {
        const usp = new URLSearchParams(window.location.search);
        const reeval = usp.get('reeval');
        setReEvalMark(reeval);
    }, []);

    return (
        <div className="screenity-shadow-dom">
            <ContentState>
                <Wrapper />
                <ReEvalRecord />
            </ContentState>

            {openModal && <ReEvalModal open={openModal} onCancel={() => setOpenModal(false)} footer={false} />}

            <style type="text/css">{`
			#screenity-ui, #screenity-ui div {
				background-color: unset;
				padding: unset;
				width: unset;
				box-shadow: unset;
				display: unset;
				margin: unset;
				border-radius: unset;
			}
			.screenity-outline {
				position: absolute;
				z-index: 99999999999;
				border: 2px solid #3080F8;
				outline-offset: -2px;
				pointer-events: none;
				border-radius: 5px!important;
			}
		.screenity-blur {
			filter: blur(10px)!important;
		}
			.screenity-shadow-dom * {
				transition: unset;
			}
			.screenity-shadow-dom .TooltipContent {
  border-radius: 30px!important;
	background-color: #29292F!important;
  padding: 10px 15px!important;
  font-size: 12px;
	margin-bottom: 10px!important;
	bottom: 100px;
  line-height: 1;
	font-family: 'Satoshi-Medium', sans-serif;
	z-index: 99999999!important;
  color: #FFF;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px!important;
  user-select: none;
	transition: opacity 0.3 ease-in-out;
  will-change: transform, opacity;
	animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}

.screenity-shadow-dom .hide-tooltip {
	display: none!important;
}

.screenity-shadow-dom .tooltip-tall {
	margin-bottom: 20px;
}

.screenity-shadow-dom .tooltip-small {
	margin-bottom: 5px;
}

.screenity-shadow-dom .TooltipContent[data-state='delayed-open'][data-side='top'] {
	animation-name: slideDownAndFade;
}
.screenity-shadow-dom .TooltipContent[data-state='delayed-open'][data-side='right'] {
  animation-name: slideLeftAndFade;
}
.screenity-shadow-dom.TooltipContent[data-state='delayed-open'][data-side='bottom'] {
  animation-name: slideUpAndFade;
}
.screenity-shadow-dom.TooltipContent[data-state='delayed-open'][data-side='left'] {
  animation-name: slideRightAndFade;
}

@keyframes slideUpAndFade {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRightAndFade {
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDownAndFade {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideLeftAndFade {
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

#screenity-ui [data-radix-popper-content-wrapper] { z-index: 999999999999!important; } 

.screenity-shadow-dom .CanvasContainer {
	position: fixed;
	pointer-events: all!important;
	top: 0px!important;
	left: 0px!important;
	z-index: 99999999999!important;
}
.screenity-shadow-dom .canvas {
	position: fixed;
	top: 0px!important;
	left: 0px!important;
	z-index: 99999999999!important;
	background: transparent!important;
}
.screenity-shadow-dom .canvas-container {
	top: 0px!important;
	left: 0px!important;
	z-index: 99999999999;
	position: fixed!important;
	background: transparent!important;
}

.ScreenityDropdownMenuContent {
	z-index: 99999999999!important;
  min-width: 200px;
  background-color: white;
  margin-top: 4px;
  margin-right: 8px;
  padding-top: 12px;
  padding-bottom: 12px;
  border-radius: 15px;
  z-index: 99999;
  font-family: 'Satoshi-Medium', sans-serif;
  color: #29292F;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}
.ScreenityDropdownMenuContent[data-side="top"] {
  animation-name: slideDownAndFade;
}
.ScreenityDropdownMenuContent[data-side="right"] {
  animation-name: slideLeftAndFade;
}
.ScreenityDropdownMenuContent[data-side="bottom"] {
  animation-name: slideUpAndFade;
}
.ScreenityDropdownMenuContent[data-side="left"] {
  animation-name: slideRightAndFade;
}
.ScreenityItemIndicator {
  position: absolute;
  right: 12px; 
  width: 18px;
  height: 18px;
  background: #3080F8;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ScreenityDropdownMenuItem,
.ScreenityDropdownMenuRadioItem {
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 5px;
  position: relative;
  padding-left: 22px;
  padding-right: 22px;
  user-select: none;
  outline: none;
}
.ScreenityDropdownMenuItem:hover {
    background-color: #F6F7FB !important;
    cursor: pointer;
}
.ScreenityDropdownMenuItem[data-disabled] {
  color: #6E7684; !important;
  cursor: not-allowed;
  background-color: #F6F7FB !important;
}



@keyframes slideUpAndFade {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRightAndFade {
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDownAndFade {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideLeftAndFade {
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.reeval-ball {
  position: fixed;
  right: 4px;
  top: 32px;
  z-index: 99999;
  padding: 8px 16px;
  background: #1772f6;
  border-radius: 8px;
  outline: auto;
  color: #fff;
  font-size: 14px;
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji';
  line-height: normal;
  box-shadow: 11px 8px 8px 0px rgb(18 147 227 / 25%);
  transform: rotate(45deg);
  transition: all .3s;
}

.reeval-ball.reeval-ball-added {
  right: 0px;
  top: 44px;
  font-size: 12px;
  background: #f66b11;
}

.reeval-ball.reeval-ball-added:hover {
  background: #f66b11;
}

.reeval-ball:hover {
  background: rgb(18 147 227 / 85%);
  cursor: pointer;
  transition: all .3s;
}

.reeval-urls-count {
  position: fixed;
  top: 5px;
  right: 75px;
  min-width: 16px;
  height: 16px;
  background: #f00;
  border-radius: 50%;
  font-size: 12px;
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji';
  border: 1px solid #fff;
  color: #fff;
  text-align: center;
  line-height: 16px;
  z-index: 1000000;
  transform: rotate(45deg);
}

.reeval-urls-count:hover {
  transform: scale(1.5);
  transition: all 1s;
  cursor: pointer;
}



`}</style>
        </div>
    );
};

export default Content;
