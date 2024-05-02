import { groupBy, upperFirst } from 'lodash-es';
import { Modules } from './Constant';
import { DeleteAction, DetailAction, EditAction, RECrud, expandColumns } from './RECrud';
import { ruyiStore } from './store';
import React, { useState } from 'react';
import { Card, List, Tabs } from 'antd';
import Plyr from 'plyr-react';
import '../Sandbox/styles/plyr.css';
import { getMediaSourceURL } from './bus';
import { DownloadAction } from './RECrud';
import dayjs from 'dayjs';

const module = Modules.ASSETS;

const columns = [
    { dataIndex: 'id', title: 'ID', width: 260 },
    { dataIndex: 'title', title: 'Title', ellipsis: true },
    { dataIndex: 'url', title: 'URL', ellipsis: true },
    ...expandColumns(module)
];

const ImageAssets = ({ data, module }) => {
    return (
        <List
            grid={{ gutter: 8, column: 4 }}
            dataSource={data}
            renderItem={(item) => {
                return (
                    <List.Item>
                        <Card
                            cover={<img alt={item.id} crossOrigin="anonymous" src={getMediaSourceURL(module, item.id)} />}
                            actions={[
                                <EditAction key={'edit'} record={item} module={module} />,
                                <DeleteAction key={'delete'} record={item} module={module} />
                            ]}
                        >
                            <Card.Meta title={item.file_name} description={item.id} />
                        </Card>
                    </List.Item>
                );
            }}
        />
    );
};

export const VideoAssets = ({ data = [], module, loading }) => {
    return (
        <List
            grid={{ gutter: 8, column: 3 }}
            dataSource={data}
            loading={loading}
            renderItem={(item) => {
                return (
                    <List.Item>
                        <Card
                            cover={
                                <Plyr
                                    crossOrigin="anonymous"
                                    source={{
                                        type: 'video',
                                        title: `${item?.asset_name}`,
                                        sources: [{ src: getMediaSourceURL(module, item.id), type: 'video/mp4', size: 720 }]
                                    }}
                                />
                            }
                            actions={[
                                <DetailAction key={'edit'} record={item} module={module} />,
                                <DeleteAction key={'delete'} record={item} module={module} />,
                                <DownloadAction key={'download'} record={item} module={module} />
                            ]}
                        >
                            <Card.Meta
                                title={item.name}
                                description={
                                    <>
                                        <div>Production: {item.production_id}</div>
                                        <div>{dayjs(item.created_at).format('YYYY-MM-DD')}</div>
                                    </>
                                }
                            />
                        </Card>
                    </List.Item>
                );
            }}
        />
    );
};

export const VoiceAssets = ({ data, module, loading }) => {
    return (
        <List
            grid={{ gutter: 8, column: 3 }}
            dataSource={data}
            loading={loading}
            renderItem={(item) => {
                return (
                    <List.Item>
                        <Card
                            cover={
                                <Plyr
                                    crossOrigin="anonymous"
                                    source={{
                                        type: 'audio',
                                        title: `${item?.asset_name}`,
                                        sources: [{ src: getMediaSourceURL(module, item.id), type: 'audio/wav' }]
                                    }}
                                />
                            }
                            actions={[
                                <EditAction key={'edit'} record={item} module={module} />,
                                <DeleteAction key={'delete'} record={item} module={module} />,
                                <DownloadAction key={'download'} record={item} module={module} />
                            ]}
                        >
                            <Card.Meta title={item.file_name} description={item.id} />
                        </Card>
                    </List.Item>
                );
            }}
        />
    );
};

// export const FontNames = ({ module }) => {
//     return <div>Font Names</div>;
// };

// export const VoiceNames = ({ module }) => {
//     return <div>Voice Names</div>;
// };

const Assets = ({ data, module }) => {
    const group = groupBy(
        data.map((item) => {
            item.type = item.content_type.split('/')[0];
            return item;
        }),
        'type'
    );
    const tabs = Object.keys(group).map((item) => {
        return {
            key: item,
            label: upperFirst(item),
            children:
                item === 'image' ? (
                    <ImageAssets data={group[item]} module={module} />
                ) : item === 'video' ? (
                    <VideoAssets data={group[item]} module={module} />
                ) : (
                    <VoiceAssets data={group[item]} module={module} />
                )
        };
    });
    // const others = [
    //     {
    //         key: 'font-names',
    //         label: 'Font name',
    //         children: FontNames
    //     },
    //     {
    //         key: 'voice_names',
    //         lebel: 'Voice names'
    //     }
    // ];
    const [activeKey, setActiveKey] = useState(tabs?.[0]?.key);
    return <Tabs items={tabs} activeKey={activeKey} onChange={setActiveKey} />;
};

export const REAssets = () => {
    const render = (data) => {
        return data?.length ? <Assets data={data} module={module} /> : <></>;
    };
    return <RECrud label={'Assets'} selector={ruyiStore({ module })} columns={columns} add={false} upload={true} listRender={render} />;
};
