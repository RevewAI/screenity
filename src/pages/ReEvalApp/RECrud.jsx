import { Table, Button, Space, Popconfirm, Modal, Input, message, Upload, Spin } from 'antd';
import { useRecoilRefresher_UNSTABLE, useRecoilValueLoadable } from 'recoil';
import React, { useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ruyiStore, useRuyi } from './store';
import { Constants } from './Constant';

export const DeleteAction = ({ record }) => {
    const { id, module } = record;
    const remove = useRuyi(module)('remove');
    return (
        <Popconfirm title={'? 确认'} description={'请确认删除'} onConfirm={async () => await remove({ id })} style={{ width: 120 }}>
            <DeleteOutlined />
        </Popconfirm>
    );
};

export const EditModal = ({ record, ...rest }) => {
    const { id, module } = record;
    const { contents } = useRecoilValueLoadable(ruyiStore({ params: { id }, module }));
    return (
        <Modal title={id} open={open} footer={null} width={800} {...rest}>
            <Input.TextArea autoSize value={JSON.stringify(contents?.data, null, 2)} />
        </Modal>
    );
};

export const EditAction = ({ record, module }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <EditOutlined onClick={() => setOpen(!open)} />
            {open && <EditModal open={open} record={record} module={module} onCancel={() => setOpen(false)} />}
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

export const commons = (module, moreActions) => {
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
            width: 160,
            fixed: 'right',
            render: (text, record) => {
                return (
                    <Space size={8}>
                        <EditAction record={record} module={module} />
                        <DeleteAction record={record} module={module} />
                        {moreActions?.(module, record) ?? moreActions}
                    </Space>
                );
            }
        }
    ];
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
