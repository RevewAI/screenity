import React from 'react';
import { createBrowserRouter, createMemoryRouter, RouterProvider, createHashRouter } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { routes } from './routes';

dayjs.locale('zh-cn');

const ReEvalApp = () => {
    return (
        // <ConfigProvider
        //     locale={zhCN}
        //     theme={{
        //         token: {
        //             colorPrimary: Constant.PRIAMRY_COLOR
        //         }
        //     }}
        // >
        // <RouterProvider router={createMemoryRouter(routes, { basename: '/' })} fallbackElement={<></>} />
        // <RouterProvider router={createBrowserRouter(routes, { basename: '/', window: window })} fallbackElement={<></>} />
        <RouterProvider router={createHashRouter(routes, { basename: '/', window: window })} fallbackElement={<></>} />
        // </ConfigProvider>
    );
};

export default ReEvalApp;
