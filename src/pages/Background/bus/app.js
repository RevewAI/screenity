import { StorageKey } from '../../ReEvalApp/Constant';
import { local } from '../../ReEvalApp/utils';

export async function getAppTabId() {
    const tabId = await local.get(StorageKey.APP_TAB_ID);
}
