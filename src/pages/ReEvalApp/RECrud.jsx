import { Table, Button, Space, Popconfirm, Modal, Input, message, Upload, Spin, Form, Tooltip } from 'antd';
import { useRecoilRefresher_UNSTABLE, useRecoilValueLoadable } from 'recoil';
import React, { useEffect, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, ProfileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ruyiStore, useRuyi } from './store';
import { Constants } from './Constant';
import { useForm } from 'antd/es/form/Form';
import { mapValues } from 'lodash-es';

export const DeleteAction = ({ record }) => {
    const { id, module } = record;
    const remove = useRuyi(module)('remove');
    return (
        <Popconfirm title={'? 确认'} description={'请确认删除'} onConfirm={async () => await remove({ id })} style={{ width: 120 }}>
            <Tooltip title={'删除'}>
                <DeleteOutlined />
            </Tooltip>
        </Popconfirm>
    );
};

export const DetailModal = ({ record, ...rest }) => {
    const { id, module } = record;
    const { contents } = useRecoilValueLoadable(ruyiStore({ params: { id }, module }));
    return (
        <Modal title={id} open={open} footer={null} width={800} {...rest}>
            <Input.TextArea autoSize value={JSON.stringify(contents?.data, null, 2)} />
        </Modal>
    );
};

export const DetailAction = ({ record, module }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Tooltip title={'详情'}>
                <ProfileOutlined onClick={() => setOpen(!open)} />
            </Tooltip>
            {open && <DetailModal open={open} record={record} module={module} onCancel={() => setOpen(false)} />}
        </>
    );
};

export const EditAction = ({ record, module, modal: Modal }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Tooltip title={'编辑'}>
                <EditOutlined onClick={() => setOpen(!open)} />
            </Tooltip>
            {open && <Modal open={open} record={record} module={module} onCancel={() => setOpen(false)} />}
        </>
    );
};

export const AssetUpload = ({ module, selector }) => {
    const refresh = useRecoilRefresher_UNSTABLE(selector);
    const [loading, setLoading] = useState(false);
    const props = {
        name: 'file',
        action: `${Constants.RESOURCE_BASE}/assets`,
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
        <Upload {...props} disabled={loading}>
            <Button type={'primary'} shape={'round'} icon={loading ? <Spin /> : <UploadOutlined />}>
                Upload Assets
            </Button>
        </Upload>
    );
};

export const expandColumns = (module, moreActions, modal, setting = {}) => {
    return [
        { dataIndex: 'status', title: 'Status', width: 110 },
        {
            dataIndex: 'created_at',
            title: 'Create Date',
            width: 150,
            sorter: (a, b) => dayjs(a.created_at) - dayjs(b.created_at),
            render: (text) => {
                return dayjs(text).format('YYYY-MM-DD');
            }
        },
        {
            dataIndex: 'action',
            title: 'Action',
            width: 100,
            fixed: 'right',
            render: (text, record) => {
                return (
                    <Space size={8}>
                        <DetailAction record={record} module={module} />
                        {!!modal && <EditAction record={record} module={module} modal={modal} />}
                        <DeleteAction record={record} module={module} />
                        {moreActions?.(module, record)}
                    </Space>
                );
            }
        }
    ].map((item) => {
        const option = setting?.[item.dataIndex] ?? {};
        return mapValues(item, (value, key) => {
            return option?.[key] ?? value;
        });
    });
};

export const RECrud = ({ module, label, selector, columns = [], add, add: AddModal, upload, listRender }) => {
    const { contents, state } = useRecoilValueLoadable(selector);
    const [open, setOpen] = useState(false);
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16 }}>
                <span style={{ fontSize: 18 }}>{label}</span>
                {!!add && (
                    <>
                        <Button type={'primary'} shape="circle" icon={<PlusOutlined />} onClick={() => setOpen(true)} />
                        {open && <AddModal open={open} module={module} onCancel={() => setOpen(false)} />}
                    </>
                )}

                {!!upload && <AssetUpload module={module} selector={selector} />}
            </div>
            {listRender ? (
                listRender(contents?.data)
            ) : (
                <Table
                    loading={state === 'loading'}
                    columns={columns}
                    dataSource={contents?.data}
                    scroll={{ x: 1300 }}
                    pagination={{ pageSize: 20, showTotal: (total) => `Total ${total} items` }}
                />
            )}
        </>
    );
};
