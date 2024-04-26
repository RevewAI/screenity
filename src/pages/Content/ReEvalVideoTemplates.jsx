import React, { Suspense, useEffect, useState } from 'react';
import { Form, Button, Input, Spin, List, Select, message, Card, Upload, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined, ProfileOutlined } from '@ant-design/icons';
import { useAjax, assetsStore, assetIdStore, base, itemStore, Store, videoTemplatesStore, videoTemplateItemIdStore } from './store';
import { useRecoilRefresher_UNSTABLE, useRecoilValue, useRecoilState, useRecoilValueLoadable } from 'recoil';
import { groupBy } from 'lodash-es';
import Plyr from 'plyr-react';
import '../Sandbox/styles/plyr.css';

export const AssetDetail = (props) => {
    const { id, ...extra } = props;
    const { contents } = useRecoilValueLoadable(itemStore(Store.VIDEO_TEMPLATES));
    return (
        <Modal footer={<></>} {...extra}>
            <Input.TextArea autoSize value={JSON.stringify(contents?.data, null, 2)} />
        </Modal>
    );
};

export const VideoTemplateItem = (props) => {
    const { item } = props;
    const [id, setId] = useRecoilState(videoTemplateItemIdStore);
    const remove = useAjax({ method: 'delete' });
    const refresh = useRecoilRefresher_UNSTABLE(assetsStore);
    const [open, setOpen] = useState(false);

    const handleRemove = async (item) => {
        await remove({ url: `/video_templates/${item.id}` });
        refresh();
    };

    const player = (
        <Plyr
            source={{
                type: 'video',
                title: `${item?.asset_name}`,
                sources: [
                    {
                        src: `${base}/download/video_template/${item.id}`,
                        type: 'video/mp4',
                        size: 720
                    }
                ]
            }}
        />
    );

    return (
        <List.Item>
            <Card
                cover={player}
                actions={[
                    <ProfileOutlined
                        key={'profile'}
                        onClick={() => {
                            setId(item.id);
                            setOpen(true);
                        }}
                    />,
                    <DeleteOutlined key={'delete'} onClick={() => handleRemove(item)} />
                ]}
            >
                <Card.Meta title={item.name} description={item.id} />
                {open && <AssetDetail title={item.name} open={open} onCancel={() => setOpen(false)} />}
            </Card>
        </List.Item>
    );
};

export const VideoTemplates = () => {
    const { data = [] } = useRecoilValue(videoTemplatesStore);
    const refresh = useRecoilRefresher_UNSTABLE(videoTemplatesStore);
    const [loading, setLoading] = useState(false);
    const props = {
        name: 'file',
        action: `${base}/video_templates`,
        data: {},
        showUploadList: false,
        onChange(info) {
            if (info.file.status === 'uploading') {
                setLoading(true);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
                setLoading(false);
                refresh();
            } else if (info.file.status === 'error') {
                setLoading(false);
                message.error(`${info.file.name} file upload failed.`);
            }
        }
    };
    return (
        <article style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section>
                <Upload {...props} disabled={loading}>
                    <Button icon={loading ? <Spin /> : <UploadOutlined />}>Click to Upload</Button>
                </Upload>
            </section>
            <section style={{ flex: 1 }}>
                <List
                    grid={{ gutter: 8, column: 3 }}
                    dataSource={data}
                    renderItem={(item) => {
                        return <VideoTemplateItem item={item} />;
                    }}
                />
            </section>
        </article>
    );
};
