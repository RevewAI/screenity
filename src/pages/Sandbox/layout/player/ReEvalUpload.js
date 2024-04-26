import React, { useContext, useState, useEffect } from 'react';
import styles from '../../styles/player/_RightPanel.module.scss';
import { instance } from '../../../Content/store';
import { ReactSVG } from 'react-svg';
import { ContentStateContext } from '../../context/ContentState';
const URL = 'chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/assets/';
export const ReEvalUpload = () => {
    const [contentState, setContentState] = useContext(ContentStateContext);
    // const { contents, state } = useRecoilValueLoadable(productionsStore);
    // const options =
    //     contents?.data?.map?.(({ id }) => {
    //         return { label: id, value: id };
    //     }) ?? [];
    // console.log(options);

    const [production, setProduction] = useState({});

    const upload = async () => {
        console.log(contentState.blob);
        console.log(contentState);
        const fileName = `${production.id}.mp4`;
        const file = new File([contentState.blob], fileName);
        const formData = new FormData();
        formData.append('file', file, fileName);
        formData.append('production_id', production.id);
        formData.append('name', fileName);
        formData.append('voice_over_script', production.voice_over_script);
        await instance.post('/video_clips', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        chrome.storage.local.remove('production');
    };

    useEffect(() => {
        chrome.storage.local.get(['production']).then(({ production = {} }) => {
            setProduction(production);
        });
    }, []);

    return (
        <div role="button" className={styles.button} onClick={upload}>
            <div className={styles.buttonLeft}>
                <ReactSVG src={URL + 'editor/icons/drive.svg'} />
            </div>
            <div className={styles.buttonMiddle}>
                <div className={styles.buttonTitle}>上传</div>
                <div className={styles.buttonDescription}>ReEval</div>
            </div>
            <div className={styles.buttonRight}>
                <ReactSVG src={URL + 'editor/icons/right-arrow.svg'} />
            </div>
        </div>
    );
};
