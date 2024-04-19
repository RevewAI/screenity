import { selector, atom } from 'recoil';
import axios from 'axios';

export const base = 'http://40.86.244.31:8088';

export const reevalAtom = atom({
    key: 'reeval/reebalAtom',
    default: void 0
});

export const reevalStore = selector({
    key: 'reeval/reevalStore',
    get: async ({ get }) => {
        const params = get(reevalAtom);
        if (!params) return;
        const { data } = await axios.post(`${base}/submit_page`, params);
        console.log(data);
    }
});
