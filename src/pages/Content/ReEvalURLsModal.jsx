import React, { useEffect, useState } from 'react';
import { Modal, Form, Space, Button, Input } from 'antd';
import { MinusCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, PlusCircleOutlined, EyeOutlined } from '@ant-design/icons';

export const ReEvalURLsModal = (props) => {
    const [form] = Form.useForm();
    const storageKey = 'reeval-urls';

    const clear = async () => {
        await chrome.storage.local.remove([storageKey]);
        form.setFieldsValue({ urls: [] });
    };

    const sortUrlsWithChangeForm = () => {
        const urls = form.getFieldValue('urls') ?? [];
        const urls$ = urls.map(({ url }, inx) => {
            return { url, inx };
        });
        form.setFieldValue('urls', urls$);
    };

    const onFinish = async (values) => {
        const urls = values.urls.map(({ url }) => url);
        await chrome.storage.local.set({ [storageKey]: urls });
    };

    useEffect(() => {
        chrome.storage.local.get([storageKey]).then(({ [storageKey]: urls = [] }) => {
            const urls$ = urls.map((url, inx) => {
                return { url, inx };
            });
            form.setFieldValue('urls', urls$);
        });
    }, [props.open]);

    return (
        <Modal title={'ReEval URLs'} {...props} width={'80vw'}>
            <Form form={form} onFinish={onFinish}>
                <Form.List name="urls">
                    {(fields, info) => {
                        const { add, remove, move } = info;
                        if (!fields?.length) {
                            return (
                                <div style={{ padding: 8, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                                    <PlusCircleOutlined style={{ fontSize: 24 }} onClick={() => add({ inx: 0 }, 0)} />
                                </div>
                            );
                        }

                        return (
                            <>
                                {fields.map((field, inx) => {
                                    return (
                                        <div key={inx} style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
                                            {/* <EyeOutlined /> */}
                                            <Space size={0}>
                                                <Button
                                                    type="text"
                                                    shape="circle"
                                                    size="small"
                                                    icon={<ArrowUpOutlined />}
                                                    disabled={inx < 1}
                                                    onClick={() => {
                                                        move(inx, inx - 1);
                                                        sortUrlsWithChangeForm();
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
                                                        sortUrlsWithChangeForm();
                                                    }}
                                                />
                                            </Space>
                                            <Form.Item noStyle name={[field.name, 'inx']}>
                                                <Input disabled={true} placeholder="Index" style={{ width: 50, textAlign: 'center' }} />
                                            </Form.Item>
                                            <Form.Item noStyle name={[field.name, 'url']}>
                                                <Input placeholder="URL" style={{ flex: 1 }} />
                                            </Form.Item>
                                            <Space size={0}>
                                                <Button
                                                    type="text"
                                                    shape="circle"
                                                    size="small"
                                                    icon={<MinusCircleOutlined />}
                                                    onClick={() => {
                                                        remove(field.name);
                                                        sortUrlsWithChangeForm();
                                                    }}
                                                />
                                                <Button
                                                    type="text"
                                                    shape="circle"
                                                    size="small"
                                                    icon={<PlusCircleOutlined />}
                                                    onClick={() => {
                                                        add({ inx: inx + 1 }, inx + 1);
                                                        sortUrlsWithChangeForm();
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
                <div style={{ marginTop: 32, textAlign: 'right' }}>
                    <Space>
                        <Button type="text" onClick={clear}>
                            清空本地
                        </Button>
                        <Button onClick={() => form.resetFields()}>重置</Button>
                        <Button type="primary" htmlType="submit">
                            确认
                        </Button>
                    </Space>
                </div>
            </Form>
        </Modal>
    );
};
