import { Button, Form, Input, Modal, Select, Space } from 'antd';
import { Modules } from './Constant';
import { RECrud, expandColumns } from './RECrud';
import { ruyiStore, useRuyi } from './store';
import React, { useEffect, useState } from 'react';
import { ArrowDownOutlined, ArrowUpOutlined, MinusCircleOutlined, PlusCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { useRecoilValueLoadable } from 'recoil';

const module = Modules.STORIES;
const CreateStoryForm = ({ onCancel }) => {
    const [form] = Form.useForm();
    const { contents: pages } = useRecoilValueLoadable(ruyiStore({ module: Modules.PAGES }));
    const add = useRuyi(module)('add');
    const [loading, setLoading] = useState(false);

    const pageOptions = pages?.data?.map?.((item) => {
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

    const onFinish = async (values) => {
        setLoading(true);
        await add(values);
        setLoading(false);
        onCancel?.();
        form?.resetFields();
    };

    const btnProps = { type: 'text', shape: 'circle', size: 'small' };

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

            <div>Pages</div>
            <Form.List name="page_ids">
                {(fields, { add, remove, move }) => {
                    if (!fields?.length) {
                        return (
                            <>
                                <div
                                    onClick={() => add({ inx: 0 }, 0)}
                                    style={{
                                        marginTop: 8,
                                        padding: 16,
                                        display: 'flex',
                                        gap: 8,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        background: '#f5f5f5',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: 8,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <PlusCircleOutlined style={{ fontSize: 24 }} />
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
                                            <Select options={pageOptions ?? []} style={{ height: 64, flex: 1 }} />
                                        </Form.Item>
                                        <Space size={0}>
                                            <Button
                                                {...btnProps}
                                                icon={<ArrowUpOutlined />}
                                                disabled={inx < 1}
                                                onClick={() => {
                                                    move(inx, inx - 1);
                                                }}
                                            />
                                            <Button
                                                {...btnProps}
                                                icon={<ArrowDownOutlined />}
                                                disabled={inx >= fields.length - 1}
                                                onClick={() => {
                                                    move(inx, inx + 1);
                                                }}
                                            />
                                            <Button
                                                {...btnProps}
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => {
                                                    remove(field.name);
                                                }}
                                            />
                                            <Button
                                                {...btnProps}
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
        <Modal title={'Create Story'} width={800} footer={null} {...rest}>
            <CreateStoryForm module={module} onCancel={rest?.onCancel} />
        </Modal>
    );
};

export const EditStoryForm = ({ id, onCancel }) => {
    const [form] = Form.useForm();
    const { contents, state } = useRecoilValueLoadable(ruyiStore({ params: { id }, module }));
    const [loading, setLoading] = useState(false);

    const update = useRuyi(module)('put');

    const onFinish = async (values) => {
        setLoading(true);
        await update({ id }, values);
        setLoading(false);
        onCancel?.();
        form?.resetFields();
    };

    useEffect(() => {
        state === 'hasValue' && form.setFieldsValue(contents?.data);
    }, [state]);

    return (
        <Form form={form} onFinish={onFinish} layout={'vertical'} initialValues={{}}>
            <Form.Item name={'voice_over_script'} label={'Voice over script'}>
                <Input.TextArea placeholder="title" autoSize={{ minRows: 5 }} />
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

export const EditModal = ({ record, module, onCancel, ...rest }) => {
    const { id, title } = record;

    return (
        <Modal title={title} open={open} footer={null} width={800} onCancel={onCancel} {...rest}>
            <EditStoryForm id={id} onCancel={onCancel} />
        </Modal>
    );
};

const columns = [
    { dataIndex: 'id', title: 'ID', width: 260 },
    { dataIndex: 'title', title: 'Title', ellipsis: true },
    { dataIndex: 'guidance', title: 'Guidance', ellipsis: true },
    { dataIndex: 'language', title: 'Language', width: 100 },
    ...expandColumns(module, null, EditModal)
];

export const REStories = () => {
    return <RECrud label={'Stories'} selector={ruyiStore({ module: module })} columns={columns} add={AddModal} />;
};
