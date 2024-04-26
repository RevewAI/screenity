import React, { useState } from 'react';
import { Button, Input, Spin, List, message, Card, Upload, Modal } from 'antd';
import { DeleteOutlined, UploadOutlined, ProfileOutlined } from '@ant-design/icons';
import { useAjax, assetsStore, base, itemStore, Store, voiceClipsStore, voiceClipItemIdStore } from './store';
import { useRecoilRefresher_UNSTABLE, useRecoilValue, useRecoilState, useRecoilValueLoadable } from 'recoil';
import Plyr from 'plyr-react';
import '../Sandbox/styles/plyr.css';

export const VoiceClipsDetail = (props) => {
    const { id, ...extra } = props;
    const { contents } = useRecoilValueLoadable(itemStore(Store.VOICE));
    return (
        <Modal footer={<></>} {...extra}>
            <Input.TextArea autoSize value={JSON.stringify(contents?.data, null, 2)} />
        </Modal>
    );
};

export const VoiceClipsItem = (props) => {
    const { item } = props;
    const [id, setId] = useRecoilState(voiceClipItemIdStore);
    const remove = useAjax({ method: 'delete' });
    const refresh = useRecoilRefresher_UNSTABLE(voiceClipsStore);
    const [open, setOpen] = useState(false);

    const handleRemove = async (item) => {
        await remove({ url: `/voice_clips/${item.id}` });
        refresh();
    };

    const player = (
        <Plyr
            source={{
                type: 'audio',
                title: `${item?.asset_name}`,
                sources: [
                    {
                        src: `${base}/download/voice_clip/${item.id}`,
                        type: 'audio/wav'
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
                {open && <VoiceClipsDetail title={item.name} open={open} onCancel={() => setOpen(false)} />}
            </Card>
        </List.Item>
    );
};

export const VoiceClips = () => {
    const { data = [] } = useRecoilValue(voiceClipsStore);
    const refresh = useRecoilRefresher_UNSTABLE(voiceClipsStore);
    const [loading, setLoading] = useState(false);
    const props = {
        name: 'file',
        action: `${base}/voice_clips`,
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
            {/* <section>
                <Upload {...props} disabled={loading}>
                    <Button icon={loading ? <Spin /> : <UploadOutlined />}>Click to Upload</Button>
                </Upload>
            </section> */}
            <section style={{ flex: 1 }}>
                <List
                    grid={{ gutter: 8, column: 3 }}
                    dataSource={data}
                    renderItem={(item) => {
                        return <VoiceClipsItem item={item} />;
                    }}
                />
            </section>
        </article>
    );
};
