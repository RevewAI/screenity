import dayjs from 'dayjs';
import { Modules } from './Constant';
import { RECrud, expandColumns } from './RECrud';
import { ruyiStore, useRuyi } from './store';
import React, { Suspense, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Select, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const module = Modules.VIDEO_TEMPLATES;

const VideoTemplateForm = ({ onCancel, type, data }) => {
    const [form] = Form.useForm();
    const addOrUpdate = useRuyi(module)(type);
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        const args = type === 'add' ? [values] : [{ id: data.id }, values];
        await addOrUpdate(...args);
        setLoading(false);
        onCancel?.();
        form?.resetFields();
    };

    useEffect(() => {
        type === 'put' && form?.setFieldsValue(data);
    }, []);

    return (
        <Form form={form} onFinish={onFinish} layout={'vertical'} initialValues={{}}>
            <Form.Item name={'name'} label={'Name'}>
                <Input placeholder="name" />
            </Form.Item>
            <Form.Item name={'title_settings'} label={'Title Settings'}>
                <Input placeholder="Title Settings" />
            </Form.Item>
            <Form.Item name={'subtitle_settings'} label={'Subtitle Settings'}>
                <Input placeholder="Subtitle Settings" />
            </Form.Item>
            <Form.Item name={'bgm_settings'} label={'BGM Settings'}>
                <Input placeholder="BGM Settings" />
            </Form.Item>
            <Form.Item name={'voice_over_settings'} label={'Voice Settings'}>
                <Input placeholder="Voice Settings" />
            </Form.Item>
            <Form.Item name={'credits_settings'} label={'Voice Settings'}>
                <Input placeholder="Voice Settings" />
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

export const CreateVideoTemplateModal = ({ module, ...rest }) => {
    return (
        <Modal title={'Create Video Template'} width={800} footer={null} {...rest}>
            <Suspense fallback={<Spin />}>
                <VideoTemplateForm module={module} onCancel={rest?.onCancel} type={'add'} />
            </Suspense>
        </Modal>
    );
};

const EditVideoTemplateModal = ({ module, record, ...rest }) => {
    return (
        <Modal title={'Edit Video Template'} width={800} footer={null} {...rest}>
            <Suspense fallback={<Spin />}>
                <VideoTemplateForm data={record} module={module} onCancel={rest?.onCancel} type={'put'} />
            </Suspense>
        </Modal>
    );
};

export const REVideoTemplates = () => {
    const columns = [
        { dataIndex: 'id', title: 'ID', width: 240 },
        { dataIndex: 'name', title: 'Name', ellipsis: true, width: 240 },
        { dataIndex: 'title_settings', title: 'Title Settings', ellipsis: true, width: 240 },
        { dataIndex: 'subtitle_settings', title: 'Subtitle Settings', ellipsis: true, width: 240 },
        { dataIndex: 'bgm_settings', title: 'BGM Settings', ellipsis: true, width: 240 },
        { dataIndex: 'voice_over_settings', title: 'Voice over', ellipsis: true, width: 240 },
        { dataIndex: 'credits_settings', title: 'Credits Settings', ellipsis: true, width: 240 },
        ...expandColumns(module, null, EditVideoTemplateModal, { status: false })
    ];
    return <RECrud label={'Video Templates'} columns={columns} selector={ruyiStore({ module })} add={CreateVideoTemplateModal} />;
};
