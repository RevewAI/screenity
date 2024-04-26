import React, { Suspense, useEffect, useState } from 'react';
import { Modal, Form, Space, Button, Input, Spin, Tabs, List, Select, message } from 'antd';
import { MinusCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, PlusCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { baseAjax, baseStore, pagesStore, useAjax, pageStore, storyStore } from './store';
import { useRecoilRefresher_UNSTABLE, useRecoilValueLoadable, useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';
import { isEmpty } from 'lodash-es';

const storiesStore = baseAjax({ url: '/stories' });
const idStore = baseStore('string_STORY_ID');

const StoryForm = () => {
    const [form] = Form.useForm();
    const [id, setId] = useRecoilState(idStore);
    const { data: story = {} } = useRecoilValue(storyStore);
    const { data: pages = [] } = useRecoilValue(pagesStore);

    const pageOptions = pages.map((item) => {
        return {
            value: item.id,
            label: (
                <section style={{ maxWidth: 480 }}>
                    <div>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#777' }}>{item.url}</div>
                </section>
            )
        };
    });
    const put = useAjax({ method: 'put' });
    const create = useAjax({ method: 'post' });
    const refresh = useRecoilRefresher_UNSTABLE(storiesStore);
    const refreshStory = useRecoilRefresher_UNSTABLE(storyStore);

    const onFinish = async (values) => {
        id ? await put({ url: `/stories/${id}`, data: values }) : await create({ url: `/stories`, data: values });
        refresh();
        refreshStory();
        setId('');
        form?.resetFields();
        message.success(id ? 'Modify success' : 'Create Success');
    };

    useEffect(() => {
        id ? form?.setFieldsValue?.(story) : form?.resetFields();
    }, [id]);

    return (
        <Form form={form} onFinish={onFinish} layout={'vertical'} initialValues={{}}>
            <Form.Item name={'title'} label={'Title'}>
                <Input placeholder="title" />
            </Form.Item>
            <Form.Item name={'language'} label={'Language'}>
                <Select
                    placeholder="language"
                    options={[
                        { label: 'zh', value: 'zh' },
                        { label: 'en', value: 'en' }
                    ]}
                />
            </Form.Item>
            <Form.Item name={'guidance'} label={'Guidance'}>
                <Input placeholder="guidance" />
            </Form.Item>
            <Form.Item name={'voice_over_script'} label={'Voice_over_script'}>
                <Input.TextArea placeholder="Voice over script" />
            </Form.Item>

            <div>Pages</div>
            <Form.List name="page_ids">
                {(fields, { add, remove, move }) => {
                    if (!fields?.length) {
                        return (
                            <>
                                <div style={{ padding: 8, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                                    <PlusCircleOutlined style={{ fontSize: 24 }} onClick={() => add({ inx: 0 }, 0)} />
                                </div>
                            </>
                        );
                    }
                    return (
                        <>
                            {fields.map((field, inx) => {
                                return (
                                    <div key={inx} style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
                                        <Form.Item noStyle {...field}>
                                            <Select options={pageOptions} style={{ height: 64, flex: 1 }} />
                                        </Form.Item>
                                        <Space size={0}>
                                            <Button
                                                type="text"
                                                shape="circle"
                                                size="small"
                                                icon={<ArrowUpOutlined />}
                                                disabled={inx < 1}
                                                onClick={() => {
                                                    move(inx, inx - 1);
                                                }}
                                            />
                                            <Button
                                                type="text"
                                                shape="circle"
                                                size="small"
                                                icon={<ArrowDownOutlined />}
                                                disabled={inx >= fields.length - 1}
                                                onClick={() => {
                                                    move(inx, inx + 1);
                                                }}
                                            />
                                            <Button
                                                type="text"
                                                shape="circle"
                                                size="small"
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => {
                                                    remove(field.name);
                                                }}
                                            />
                                            <Button
                                                type="text"
                                                shape="circle"
                                                size="small"
                                                icon={<PlusCircleOutlined />}
                                                onClick={() => {
                                                    add({ inx: inx + 1 }, inx + 1);
                                                }}
                                            />
                                        </Space>
                                    </div>
                                );
                            })}
                        </>
                    );
                }}
            </Form.List>

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setId('')}>新建Story</Button>
                <Button type="primary" htmlType="submit">
                    确定
                </Button>
            </div>
        </Form>
    );
};

export const Stories = () => {
    const { data = [] } = useRecoilValue(storiesStore);
    const [id, setId] = useRecoilState(idStore);
    const remove = useAjax({ method: 'delete' });
    const refresh = useRecoilRefresher_UNSTABLE(storiesStore);
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
                                    <a key="list-loadmore-edit" onClick={() => setId(item.id)}>
                                        edit
                                    </a>,
                                    <a
                                        key="list-loadmore-more"
                                        onClick={async () => {
                                            await remove({ url: `/stories/${item.id}` });
                                            refresh();
                                        }}
                                    >
                                        delete
                                    </a>
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
                    <StoryForm />
                </Suspense>
            </section>
        </article>
    );
};
