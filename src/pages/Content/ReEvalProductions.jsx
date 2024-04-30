import React, { Fragment, Suspense, useEffect, useState } from 'react';
import { Modal, Form, Button, Input, Spin, List, Select, message, Popconfirm } from 'antd';
import { EditOutlined, VideoCameraAddOutlined, ProductOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { baseAjax, baseStore, useAjax, productionStore, useProduceProduction, base } from './store';
import { useRecoilRefresher_UNSTABLE, useRecoilValue, useRecoilState } from 'recoil';
import { isEmpty } from 'lodash-es';
import Plyr from 'plyr-react';
import '../Sandbox/styles/plyr.css';

export const templatesStore = baseAjax({ url: '/video_templates' });
export const productionsStore = baseAjax({ url: '/productions' });
export const storiesStore = baseAjax({ url: '/stories' });
export const idStore = baseStore('string_Production_ID');

const ProductionForm = () => {
    const [form] = Form.useForm();
    const [id, setId] = useRecoilState(idStore);
    const { data: production = {} } = useRecoilValue(productionStore);
    const { data: videoTemplates = [] } = useRecoilValue(templatesStore);
    const { data: stories = [] } = useRecoilValue(storiesStore);

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

    const put = useAjax({ method: 'put' });
    const create = useAjax({ method: 'post' });
    const refreshItem = useRecoilRefresher_UNSTABLE(productionStore);
    const refreshList = useRecoilRefresher_UNSTABLE(productionsStore);

    const onFinish = async (values) => {
        id ? await put({ url: `/productions/${id}`, data: values }) : await create({ url: `/productions`, data: values });
        refreshItem();
        refreshList();
        setId('');
        form?.resetFields();
        message.success(id ? 'Modify success' : 'Create Success');
    };

    useEffect(() => {
        id ? form?.setFieldsValue?.(production) : form?.resetFields();
    }, [id]);

    return (
        <Form form={form} onFinish={onFinish} layout={'vertical'} initialValues={{}}>
            {!id && (
                <>
                    <Form.Item name={'story_id'} label={'Select Story'}>
                        <Select placeholder="Select Story" options={storyOptions} style={{ height: 70 }} />
                    </Form.Item>
                    <Form.Item name={'template_id'} label={'Select Video Template'}>
                        <Select placeholder="Select Video Template" options={videoTemplateOptions} style={{ height: 70 }} />
                    </Form.Item>

                    <Form.Item name={'voice_name'} label={'Voice Name'} initialValue={'zh-CN-YunxiNeural'}>
                        <Input placeholder="Select Video Template" />
                    </Form.Item>
                </>
            )}
            {id && (
                <Form.Item name={'storyboard'} label={'Storyboard'}>
                    <Storyboard />
                </Form.Item>
            )}
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setId('')}>新建Production</Button>
                <Button type="primary" htmlType="submit">
                    确定
                </Button>
            </div>
        </Form>
    );
};

const Storyboard = (props) => {
    const { onChange, value } = props;
    const [val, setVal] = useState(value);
    useEffect(() => {
        setVal(value);
    }, [value]);
    return (
        <Input.TextArea
            autoSize
            placeholder="Storyboard"
            value={JSON.stringify(val, null, 2)}
            onChange={(e) => {
                const newValue = e.target.value;
                try {
                    const val = JSON.parse(newValue);
                    setVal(val);
                    onChange?.(val);
                } catch (e) {}
            }}
        />
    );
};

export const ProductionItem = (props) => {
    const { item } = props;
    const [id, setId] = useRecoilState(idStore);
    const remove = useAjax({ method: 'delete' });
    const refresh = useRecoilRefresher_UNSTABLE(productionsStore);
    const produce = useProduceProduction();
    const [play, setPlay] = useState(false);

    // created 新建, 等待storyboard生成
    // processed 已生成，等待录屏
    // recorded 已录屏，并提交录屏视频，等待视频合成
    // producing 视频合成中
    // success 视频合成成功
    // failed 视频合成失败

    const statusActionMap = {
        created: {},
        creating_storyboard: { recording: true },
        processed: { recording: true },
        processing: { recording: true },
        recorded: { recording: true, producing: true },
        producing: { recording: true, producing: true },
        success: { recording: true, producing: true, play: true }
    };

    const action = statusActionMap[item.status] ?? {};

    // 开始录屏
    const camera = (production) => {
        if (isEmpty(production?.storyboard)) return;
        chrome.runtime.sendMessage({ type: 'reeval-storyboard', options: production });
    };

    const handleRemove = async (item) => {
        await remove({ url: `/productions/${item.id}` });
        refresh();
    };

    return (
        <List.Item
            style={{
                background: id === item.id ? 'rgb(206 239 242 / 19%)' : 'transparent',
                borderRadius: 10
            }}
            actions={[
                <EditOutlined key={'edit'} onClick={() => setId(item.id)} />,
                <Popconfirm
                    key={'delete'}
                    title="确认"
                    description="确认删除?"
                    onConfirm={() => {
                        handleRemove(item);
                    }}
                    okText="Yes"
                    cancelText="No"
                >
                    <DeleteOutlined />
                </Popconfirm>,
                <Fragment key={'recording'}>{action.recording ? <VideoCameraAddOutlined onClick={() => camera(item)} /> : null}</Fragment>,
                <Fragment key={'producing'}>
                    {action.producing ? (
                        <ProductOutlined
                            onClick={async () => {
                                message.info('视频合成中，请等待');
                                await produce(item.id);
                                message.info('视频合成成功');
                                refresh();
                            }}
                        />
                    ) : null}
                </Fragment>,
                <Fragment key={'play'}>{action.play ? <PlayCircleOutlined onClick={() => setPlay(true)} /> : null} </Fragment>
            ].filter(Boolean)}
        >
            <List.Item.Meta
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item?.id}</span>
                        <span>{item?.status}</span>
                    </div>
                }
                description={item?.voice_over_script?.substring?.(0, 100)}
            />
            {action.play && play && (
                <Modal title={item.id} footer={null} width={800} height={600} open={play} onCancel={() => setPlay(false)}>
                    <Plyr
                        source={{
                            type: 'video',
                            title: `${item?.id}`,
                            sources: [
                                {
                                    src: `${base}/download/production/${item.id}`,
                                    type: 'video/mp4',
                                    size: 720
                                }
                            ]
                        }}
                    />
                </Modal>
            )}
        </List.Item>
    );
};

export const Productions = () => {
    const { data = [] } = useRecoilValue(productionsStore);
    return (
        <article style={{ display: 'flex', gap: 16 }}>
            <section style={{ flex: 1 }}>
                <List
                    dataSource={data}
                    renderItem={(item) => {
                        return <ProductionItem item={item} />;
                    }}
                />
            </section>
            <section style={{ flex: 1 }}>
                <Suspense fallback={<Spin />}>
                    <ProductionForm />
                </Suspense>
            </section>
        </article>
    );
};
