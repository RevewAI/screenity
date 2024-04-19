import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';

export const ReEvalURLsModal = (props) => {
    const storageKey = 'reeval-urls';
    const [urls, setURLs] = useState([]);

    useEffect(() => {
        chrome.storage.local.get([storageKey]).then(({ [storageKey]: urls }) => {
            setURLs(urls);
        });
    }, []);

    return (
        <Modal title={'ReEval URLs'}>
            <From fields={{ urls }}>
                <Form.List name="urls">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'first']}
                                        rules={[{ required: true, message: 'Missing first name' }]}
                                    >
                                        <Input placeholder="First Name" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'last']}
                                        rules={[{ required: true, message: 'Missing last name' }]}
                                    >
                                        <Input placeholder="Last Name" />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add field
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </From>
        </Modal>
    );
};
