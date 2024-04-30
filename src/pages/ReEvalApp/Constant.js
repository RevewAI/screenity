export const Modules = {
    PAGES: 'pages',
    STORIES: 'stories',
    PRODUCTIONS: 'productions',
    VIDEO_TEMPLATES: 'video_templates',
    VIDEO_CLIPS: 'video_clips',
    VOICE_CLIPS: 'voice_clips',
    ASSETS: 'assets',
    VOICE_NAMES: 'voice_names',
    FONT_NAMES: 'font_names'
};

export const Resources = {
    [Modules.PAGES]: '/pages',
    [Modules.STORIES]: '/stories',
    [Modules.PRODUCTIONS]: '/productions',
    [Modules.VIDEO_TEMPLATES]: '/video_templates',
    [Modules.VIDEO_CLIPS]: '/video_clips',
    [Modules.VOICE_CLIPS]: '/voice_clips',
    [Modules.ASSETS]: '/assets',
    [Modules.VOICE_NAMES]: '/voice_names',
    [Modules.FONT_NAMES]: '/font_names'
};

// asset, voice_clip, video_clip, production
export const DownloadType = {
    // [Modules.PAGES]: '/pages',
    // [Modules.STORIES]: '/stories',
    [Modules.PRODUCTIONS]: 'production',
    [Modules.VIDEO_TEMPLATES]: 'video_template',
    [Modules.VIDEO_CLIPS]: 'video_clip',
    [Modules.VOICE_CLIPS]: 'voice_clip',
    [Modules.ASSETS]: 'asset'
    // [Modules.VOICE_NAMES]: '/voice_names',
    // [Modules.FONT_NAMES]: '/font_names'
};

export const Constants = {
    PRIMARY_COLOR: '#45b7f7',
    RESOURCE_BASE: 'https://knitter.ai/videomaker',
    NOT_ADDED_REEVAL_COLOR: '#1677ff',
    ADDED_REEVAL_COLOR: '#f66b11'
};

export const MenuContext = {
    ADD: 'reeval.menu.add'
};

export const StorageKey = {
    // 缓存页面集
    PAGES: 'reeval.storage.pages',
    // page action bar
    PAGE_ACTION_BAR: 'reeval.storage.page.action.bar',
    // app tabId
    APP_TAB_ID: 'reeval.storage.app.tab.id'
};

export const MsgKey = {
    // 更新 action count
    UPDATE_ACTION_COUNT: 'reeval.msg.update.action.count',
    // page add to reeval
    ADD_TO_REEVAL: 'reeval.msg.add.to.reeval',
    ADDED_TO_REEVAL: 'reeval.msg.added.to.reeval',
    IS_ADDED_REEVAL: 'reeval.msg.is.added',
    // APP 数据重新加载
    APP_RELOAD: 'reeval.msg.app.reload'
};
