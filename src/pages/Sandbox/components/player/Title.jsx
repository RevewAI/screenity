import React, { useContext, useState, useEffect, useRef } from 'react';

// Styles
import styles from '../../styles/player/_Title.module.scss';
const URL = '/assets/';

// Icon
import { ReactSVG } from 'react-svg';

import ShareModal from './ShareModal';

// Context
import { ContentStateContext } from '../../context/ContentState'; // Import the ContentState context
import dayjs from 'dayjs';

const Title = () => {
    const [showShare, setShowShare] = useState(false);
    const [contentState, setContentState] = useContext(ContentStateContext); // Access the ContentState context
    const inputRef = useRef(null);
    // Show the video title, as a heading by default (multiline), on click show a text input to edit the title
    const [showTitle, setShowTitle] = useState(true);
    const [production, setProduction] = useState({});
    const [title$, setTitle] = useState(contentState.title);
    const title = production?.id ? `${production.id}_${dayjs().format('YYYY-MM-DD_SSS')}` : title$;
    const [displayTitle, setDisplayTitle] = useState(title);

    useEffect(() => {
        setTitle(title);
        if (title.length > 80) {
            setDisplayTitle(title.slice(0, 80) + '...');
        } else {
            setDisplayTitle(title);
        }
    }, [title, production?.id]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleTitleClick = () => {
        setShowTitle(false);
    };

    const handleTitleBlur = () => {
        setShowTitle(true);
        setContentState((prevState) => ({
            ...prevState,
            title: title
        }));
    };

    useEffect(() => {
        if (!showTitle) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [showTitle]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                setShowTitle(true);
                setContentState((prevState) => ({
                    ...prevState,
                    title: title
                }));
            } else if (e.key === 'Escape') {
                setShowTitle(true);
                setTitle(contentState.title);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [title, production?.id]);

    useEffect(() => {
        chrome.storage.local.get(['ReEvalProductionOption']).then(({ ReEvalProductionOption = {} }) => {
            setProduction(ReEvalProductionOption);
        });
    }, []);

    return (
        <div className={styles.TitleParent}>
            {showShare && <ShareModal showShare={showShare} setShowShare={setShowShare} />}
            <div className={styles.TitleWrap}>
                {showTitle ? (
                    <>
                        <h1 onClick={handleTitleClick}>
                            {displayTitle}
                            <ReactSVG
                                src={URL + 'editor/icons/pencil.svg'}
                                className={styles.pencil}
                                styles={{ display: 'inline-block' }}
                            />
                        </h1>
                        {/* hide share by mizi */}
                        {/* <div
                            className={styles.shareButton}
                            onClick={() => {
                              setShowShare(true);
                            }}
                          >
                            <ReactSVG
                              src={URL + "editor/icons/link.svg"}
                              className={styles.shareIcon}
                            />
                            {chrome.i18n.getMessage("shareSandboxButton")}
                          </div> */}
                    </>
                ) : (
                    <input type="text" value={title} onChange={handleTitleChange} onBlur={handleTitleBlur} ref={inputRef} />
                )}
            </div>
        </div>
    );
};

export default Title;
