import { Button, Form, Modal, Select, Spin, Tooltip } from 'antd';
import { Modules } from './Constant';
import { RECrud, commons } from './RECrud';
import { ruyiStore, useRuyi } from './store';
import React, { Suspense, useState } from 'react';
import { PlayCircleOutlined, ProductOutlined, SaveOutlined, VideoCameraAddOutlined, FireOutlined } from '@ant-design/icons';
import { useRecoilValue, useRecoilValueLoadable } from 'recoil';
import { isEmpty } from 'lodash-es';
import Plyr from 'plyr-react';
import { getMediaSourceURL } from './bus';
import { VideoAssets } from './REAssets';

const ProduceAction = ({ record, module }) => {
    const produce = useRuyi(module)('put');
    const [loading, setLoading] = useState(false);
    return (
        <Tooltip title={'合成视频'}>
            {loading ? (
                <Spin size="small" />
            ) : (
                <FireOutlined
                    onClick={async () => {
                        await produce({}, {}, { url: `/productions/${record.id}/produce` });
                    }}
                />
            )}
        </Tooltip>
    );
};

const PlayModal = (props) => {
    const { record, module, ...rest } = props;
    return (
        <Modal footer={null} title={record?.id} width={800} {...rest}>
            <Plyr
                crossOrigin="anonymous"
                source={{
                    type: 'video',
                    title: `${record?.id}`,
                    sources: [{ src: getMediaSourceURL(module, record.id), type: 'video/mp4', size: 720 }]
                }}
            />
        </Modal>
    );
};

const PlayAction = ({ record, module }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Tooltip title={'播放合成视频'}>
                <PlayCircleOutlined onClick={() => setOpen(!open)} />
            </Tooltip>
            <PlayModal open={open} record={record} module={module} onCancel={() => setOpen(false)} />
        </>
    );
};

const VideoClipsByProductionModal = (props) => {
    const { record, module, data, ...rest } = props;
    return (
        <Modal footer={null} width={1500} {...rest}>
            <VideoAssets module={Modules.VIDEO_CLIPS} data={data} />
        </Modal>
    );
};

const VideoClipsByProductionAction = ({ record, module }) => {
    const [open, setOpen] = useState(false);
    const { contents } = useRecoilValueLoadable(ruyiStore({ module: Modules.VIDEO_CLIPS }));
    const data = contents?.data?.filter?.(({ production_id }) => production_id === record.id) ?? [];
    return (
        <>
            {!!data?.length && (
                <Tooltip title={'关联视频'}>
                    <ProductOutlined onClick={() => setOpen(!open)} />
                </Tooltip>
            )}
            <VideoClipsByProductionModal open={open} record={record} module={module} data={data} onCancel={() => setOpen(false)} />
        </>
    );
};

const moreActions = (module, record) => {
    const statusActionMap = {
        created: {},
        creating_storyboard: { recording: true },
        processed: { recording: true },
        processing: { recording: true },
        recorded: { recording: true, producing: true },
        producing: { recording: true, producing: true },
        success: { recording: true, producing: true, play: true }
    };

    const action = statusActionMap[record.status] ?? {};

    // 开始录屏
    const camera = (record) => {
        if (isEmpty(record?.storyboard)) return;
        chrome.runtime.sendMessage({ type: 'reeval-storyboard', options: record });
    };

    return (
        <>
            {action.recording && (
                <Tooltip title="录制视频">
                    <VideoCameraAddOutlined onClick={() => camera(record)} />
                </Tooltip>
            )}
            {action.producing && <ProduceAction module={module} record={record} />}
            {action.play && <PlayAction module={module} record={record} />}
            <VideoClipsByProductionAction module={module} record={record} />
        </>
    );
};

const columns = [
    { dataIndex: 'voice_over_script', title: 'Voice over script', fixed: 'left', ellipsis: true, width: 420 },
    { dataIndex: 'id', title: 'ID', width: 240 },
    { dataIndex: 'story_id', title: 'Story ID', ellipsis: true, width: 240 },
    { dataIndex: 'template_id', title: 'Template ID', ellipsis: true, width: 240 },
    { dataIndex: 'voice_name', title: 'Voice name', width: 200 },
    ...commons(Modules.PRODUCTIONS, moreActions)
];

const ProductionForm = ({ onCancel }) => {
    const [form] = Form.useForm();
    const add = useRuyi(Modules.PRODUCTIONS)('add');
    const [loading, setLoading] = useState(false);

    const { data: videoTemplates = [] } = useRecoilValue(ruyiStore({ module: Modules.VIDEO_TEMPLATES }));
    const { data: stories = [] } = useRecoilValue(ruyiStore({ module: Modules.STORIES }));
    const { data: voices = {} } = useRecoilValue(ruyiStore({ module: Modules.VOICE_NAMES }));

    const storyOptions = stories.map((item) => {
        return {
            value: item.id,
            label: (
                <section style={{ maxWidth: 480 }}>
                    <div>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#777' }}>{item.voice_over_script}</div>
                </section>
            )
        };
    });

    const videoTemplateOptions = videoTemplates.map((item) => {
        return {
            value: item.id,
            label: (
                <section style={{ maxWidth: 480 }}>
                    <div>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#777' }}>{item.id}</div>
                </section>
            )
        };
    });

    const voiceOptions = voices.voice_names.map((item) => {
        return { value: item, label: item };
    });

    const onFinish = async (values) => {
        setLoading(true);
        await add(values);
        setLoading(false);
        onCancel?.();
        form?.resetFields();
    };

    return (
        <Form form={form} onFinish={onFinish} layout={'vertical'} initialValues={{}}>
            <Form.Item name={'story_id'} label={'Select Story'}>
                <Select placeholder="Select Story" options={storyOptions} style={{ height: 70 }} />
            </Form.Item>
            <Form.Item name={'template_id'} label={'Select Video Template'}>
                <Select placeholder="Select Video Template" options={videoTemplateOptions} style={{ height: 70 }} />
            </Form.Item>

            <Form.Item name={'voice_name'} label={'Voice Name'}>
                <Select placeholder="Select Voice" options={voiceOptions} />
            </Form.Item>

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
                <span />
                <Button type="primary" htmlType="submit" shape={'round'} loading={loading} icon={<SaveOutlined />}>
                    确定
                </Button>
            </div>
        </Form>
    );
};

export const AddModal = ({ module, ...rest }) => {
    return (
        <Modal title={'Create Production'} width={800} footer={null} {...rest}>
            <Suspense fallback={<Spin />}>
                <ProductionForm module={module} onCancel={rest?.onCancel} />
            </Suspense>
        </Modal>
    );
};

export const REProductions = () => {
    return <RECrud label={'Productions'} selector={ruyiStore({ module: Modules.PRODUCTIONS })} columns={columns} add={AddModal} />;
};
