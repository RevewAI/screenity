import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Menu, Space, Switch, Tooltip } from 'antd';
import {
    SettingOutlined,
    BarsOutlined,
    HighlightOutlined,
    BuildOutlined,
    PlaySquareOutlined,
    VideoCameraOutlined,
    AppstoreOutlined,
    AudioOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import styles from './styles.module.scss';
import { useSetRecoilState } from 'recoil';
import { reloadAtom } from './store';
import { StorageKey } from './Constant';
const items = [
    { label: 'Pages', key: '/pages', icon: <BarsOutlined /> },
    { label: 'Stories', key: '/stories', icon: <HighlightOutlined /> },
    { label: 'Productions', key: '/productions', icon: <BuildOutlined /> },
    { label: 'Assets', key: '/assets', icon: <AppstoreOutlined /> },
    { label: 'Video Clips', key: '/clips/video', icon: <VideoCameraOutlined /> },
    { label: 'Voice Clips', key: '/clips/voice', icon: <AudioOutlined /> },
    { label: 'Video Templates', key: '/templates/video', icon: <PlaySquareOutlined /> }
];
export const ReEvalAppLayout = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const setReload = useSetRecoilState(reloadAtom);
    const [openAction, setOpenAction] = useState(false);
    const menuClick = (e) => {
        navigate(e.key);
    };

    const switchPageAction = async (checked) => {
        setOpenAction(checked);
        await chrome.storage.local.set({ [StorageKey.PAGE_ACTION_BAR]: checked });
    };

    useEffect(() => {
        chrome.storage.local.get(StorageKey.PAGE_ACTION_BAR).then(({ [StorageKey.PAGE_ACTION_BAR]: checked }) => {
            setOpenAction(checked);
        });
    }, []);

    return (
        <article className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.logo}>ReEval</div>
                <div>
                    <Space>
                        <Tooltip title={'全局重载数据'}>
                            <ReloadOutlined onClick={() => setReload(Math.random())} />
                        </Tooltip>
                        <Tooltip title={'添加页面开关'}>
                            <Switch size="small" onChange={switchPageAction} checked={openAction} />
                        </Tooltip>
                    </Space>
                </div>
            </header>
            <main className={styles.main}>
                <section className={styles.aside}>
                    <Menu onClick={menuClick} selectedKeys={[pathname]} mode="inline" items={items} />
                </section>
                <section className={styles.contents}>
                    <Outlet />
                </section>
            </main>
        </article>
    );
};
