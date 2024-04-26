import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { Form, Button, Input, Spin, List, Select, message, Card, Upload, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined, ProfileOutlined } from '@ant-design/icons';
import { useAjax, assetsStore, assetIdStore, base, itemStore, Store } from './store';
import { useRecoilRefresher_UNSTABLE, useRecoilValue, useRecoilState, useRecoilValueLoadable } from 'recoil';
import { groupBy } from 'lodash-es';
import Plyr, { usePlyr } from 'plyr-react';
import '../Sandbox/styles/plyr.css';

export const AssetDetail = (props) => {
    const { id, ...extra } = props;
    const { contents } = useRecoilValueLoadable(itemStore(Store.ASSETS));
    return (
        <Modal footer={<></>} {...extra}>
            <Input.TextArea autoSize value={JSON.stringify(contents?.data, null, 2)} />
        </Modal>
    );
};

export const AssetItem = (props) => {
    const { item, type } = props;
    const [id, setId] = useRecoilState(assetIdStore);
    const remove = useAjax({ method: 'delete' });
    const refresh = useRecoilRefresher_UNSTABLE(assetsStore);
    const [open, setOpen] = useState(false);

    const handleRemove = async (item) => {
        await remove({ url: `/assets/${item.id}` });
        refresh();
    };

    const player =
        type === 'image/jpeg' ? (
            <img alt="example" src={`${base}/download/asset/${item.id}`} />
        ) : (
            <Plyr
                source={{
                    type: 'video',
                    title: `${item?.asset_name}`,
                    sources: [
                        {
                            src: `${base}/download/asset/${item.id}`,
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
                <Card.Meta title={item.file_name} description={item.id} />
                {open && <AssetDetail title={item.file_name} open={open} onCancel={() => setOpen(false)} />}
            </Card>
        </List.Item>
    );
};

const VideoPlayer = React.forwardRef((props, ref) => {
    const { src, title, options = null, ...rest } = props;

    const raptorRef = usePlyr(ref, {
        source: {
            title,
            type: 'video',
            sources: [{ src, type: 'video/mp4', size: 720 }]
        },
        options
    });

    const palyer = useMemo(() => {
        return <video ref={raptorRef} className="plyr-react plyr" {...rest} />;
    }, [raptorRef?.current]);

    return <>{palyer}</>;
});

export const Assets = () => {
    const { data = [] } = useRecoilValue(assetsStore);
    const refresh = useRecoilRefresher_UNSTABLE(assetsStore);
    const groupData = Object.entries(groupBy(data, 'content_type'));
    const [loading, setLoading] = useState(false);
    const props = {
        name: 'file',
        action: `${base}/assets`,
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
                {groupData.map(([key, data]) => {
                    return (
                        <section key={key}>
                            <div style={{ fontSize: 16 }}>{key}</div>
                            <List
                                grid={{ gutter: 8, column: key === 'image/jpeg' ? 4 : 3 }}
                                dataSource={data}
                                renderItem={(item) => {
                                    return <AssetItem item={item} type={key} />;
                                }}
                            />
                        </section>
                    );
                })}
            </section>
        </article>
    );
};
