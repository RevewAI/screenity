import React, { useEffect, useState } from 'react';

// Components
import Wrapper from './Wrapper';

// Context
import ContentState from './context/ContentState';
import { cleanReEvalURL } from '../Background/loadReEvalConfig';
import { ReEvalURLsModal } from './ReEvalURLsModal';

const Content = () => {
    const storageKey = 'reeval-urls';
    const [count, setCount] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const markURL = async () => {
        try {
            const { [storageKey]: urls = [] } = await chrome.storage.local.get([storageKey]);
            // 不需要去重，一个页面可能出现多次
            const urls$ = [...urls, window.location.href].map(cleanReEvalURL).filter(Boolean);
            await chrome.storage.local.set({ [storageKey]: urls$ });
            setCount(urls$.length);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        chrome.storage.local.get([storageKey]).then(({ [storageKey]: urls }) => {
            setCount(urls.length);
        });

        chrome.runtime.onMessage.addListener(function listener(request) {
            if (request?.type === storageKey) {
                setCount(request?.urls?.length);
            }
        });
    }, []);

    return (
        <div className="screenity-shadow-dom">
            <ContentState>
                <Wrapper />
            </ContentState>

            <section className="reeval-ball" onClick={markURL}>
                + ReEval
            </section>
            <section className="reeval-urls-count" onClick={() => setOpenModal(true)}>
                {count}
            </section>

            <ReEvalURLsModal open={openModal} />

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
  box-shadow: 11px 8px 8px 0px rgb(18 147 227 / 25%);
  transform: rotate(45deg);
  transition: all .3s;
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
