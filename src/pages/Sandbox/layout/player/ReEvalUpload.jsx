import React, { useContext, useState, useEffect } from 'react';
import styles from '../../styles/player/_RightPanel.module.scss';
import { instance } from '../../../Content/store';
import { ReactSVG } from 'react-svg';
import { ContentStateContext } from '../../context/ContentState';
import { Spin, message } from 'antd';
const URL = 'chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/assets/';
export const ReEvalUpload = () => {
    const [contentState, setContentState] = useContext(ContentStateContext);

    const [production, setProduction] = useState({});
    const [loading, setLoading] = useState(false);

    const upload = async () => {
        console.log(contentState.blob);
        console.log('contentState', contentState);
        console.log('production', production);
        setLoading(true);
        const fileName = `${production.id}.mp4`;
        const file = new File([contentState.blob], fileName);
        const formData = new FormData();
        formData.append('file', file, fileName);
        formData.append('production_id', production.id);
        formData.append('name', contentState.title);
        formData.append('voice_over_script', production.voice_over_script);
        await instance.post('/video_clips', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        chrome.storage.local.remove('production');
        message.success('上传成功');
        setLoading(false);
    };

    useEffect(() => {
        chrome.storage.local.get(['ReEvalProductionOption']).then(({ ReEvalProductionOption = {} }) => {
            setProduction(ReEvalProductionOption);
        });
    }, []);

    if (!production?.id) {
        return <></>;
    }

    return (
        <div role="button" className={styles.button} onClick={upload}>
            <div className={styles.buttonLeft}>
                <ReactSVG src={URL + 'editor/icons/drive.svg'} />
            </div>
            <div className={styles.buttonMiddle}>
                <div className={styles.buttonTitle}>{loading ? <Spin /> : '上传 '}</div>
                <div className={styles.buttonDescription}>ReEval</div>
            </div>
            <div className={styles.buttonRight}>
                <ReactSVG src={URL + 'editor/icons/right-arrow.svg'} />
            </div>
        </div>
    );
};
