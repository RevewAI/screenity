import React, { Suspense, useEffect } from 'react';
import { Modal, Form, Button, Input, Spin, Tabs, List } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { baseStore, pagesStore, useAjax, pageStore } from './store';
import { useRecoilRefresher_UNSTABLE, useRecoilValue, useRecoilState } from 'recoil';
import { isEmpty } from 'lodash-es';
import { Stories } from './ReEvalStories';
import { Productions } from './ReEvalProductions';
import { VideoClips } from './ReEvalVideoClips';
import { Assets } from './ReEvalAssets';
import { VideoTemplates } from './ReEvalVideoTemplates';
import { VoiceClips } from './ReEvalVoiceClips';

const PageForm = () => {
    const [form] = Form.useForm();
    const { data } = useRecoilValue(pageStore);
    const pageId = useRecoilValue(baseStore('string_PAGE_ID'));
    const put = useAjax({ method: 'put' });
    const refresh = useRecoilRefresher_UNSTABLE(pagesStore);

    const onFinish = async (values) => {
        const config = { url: `/pages/${pageId}`, data: values };
        await put(config);
        refresh();
    };

    useEffect(() => {
        !isEmpty(data) && form.setFieldsValue(data);
    }, [data]);
    return (
        <Form form={form} onFinish={onFinish}>
            <Form.Item name="url">
                <Input placeholder="url" />
            </Form.Item>
            <Form.Item name={'title'}>
                <Input placeholder="title" />
            </Form.Item>
            <Form.Item name={'guidance'}>
                <Input placeholder="guidance" />
            </Form.Item>
            <Form.Item name={['summaries', 'en']}>
                <Input.TextArea placeholder="summaries en" />
            </Form.Item>
            <Form.Item name={['summaries', 'zh']}>
                <Input.TextArea placeholder="summaries zh" />
            </Form.Item>
            <div style={{ marginTop: 32 }}>
                <Button htmlType="submit">确定</Button>
            </div>
        </Form>
    );
};

const PagesList = () => {
    const { data = [] } = useRecoilValue(pagesStore);
    const refresh = useRecoilRefresher_UNSTABLE(pagesStore);
    const [id, setPageId] = useRecoilState(baseStore('string_PAGE_ID'));
    const remove = useAjax({ method: 'delete' });
    const handleRemove = async (item) => {
        await remove({ url: `/pages/${item.id}` });
        refresh();
    };
    return (
        <article style={{ display: 'flex', gap: 16 }}>
            <section style={{ flex: 1 }}>
                <List
                    dataSource={data}
                    renderItem={(item) => {
                        return (
                            <List.Item
                                style={{
                                    background: id === item.id ? 'rgb(206 239 242 / 19%)' : 'transparent',
                                    borderRadius: 10
                                }}
                                actions={[
                                    <EditOutlined key={'edit'} onClick={() => setPageId(item.id)} />,
                                    <DeleteOutlined key={'delete'} onClick={() => handleRemove(item)} />
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <a href="item.url" target="_blank">
                                            {item.url}
                                        </a>
                                    }
                                    description={item.title}
                                />
                            </List.Item>
                        );
                    }}
                />
            </section>
            <section style={{ flex: 1 }}>
                <Suspense fallback={<Spin />}>
                    <PageForm />
                </Suspense>
            </section>
        </article>
    );
};

export const ReEvalModal = (props) => {
    const items = [
        {
            key: 'pages',
            label: 'Pages',
            children: (
                <Suspense fallback={<Spin />}>
                    <PagesList />
                </Suspense>
            )
        },
        {
            key: 'story',
            label: 'Story',
            children: (
                <Suspense fallback={<Spin />}>
                    <Stories />
                </Suspense>
            )
        },
        {
            key: 'production',
            label: 'Production',
            children: (
                <Suspense fallback={<Spin />}>
                    <Productions />
                </Suspense>
            )
        },
        {
            key: 'video clips',
            label: 'Video Clips',
            children: (
                <Suspense fallback={<Spin />}>
                    <VideoClips />
                </Suspense>
            )
        },
        {
            key: 'voice clips',
            label: 'Voice Clips',
            children: (
                <Suspense fallback={<Spin />}>
                    <VoiceClips />
                </Suspense>
            )
        },
        {
            key: 'assets',
            label: 'Assets',
            children: (
                <Suspense fallback={<Spin />}>
                    <Assets />
                </Suspense>
            )
        },
        {
            key: 'video-template',
            label: 'Video Template',
            children: (
                <Suspense fallback={<Spin />}>
                    <VideoTemplates />
                </Suspense>
            )
        }
    ];
    return (
        <Modal title={'ReEval'} {...props} width={'80vw'}>
            <Tabs items={items} />
        </Modal>
    );
};

// https://knitter.ai/videomaker/
