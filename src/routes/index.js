import DashBoard from "../pages/DashBoard/DashBoard"
import OrderPage from "../pages/OrderPage/PartPage/MainOrder/OrderPage"
import AccountPage from "../pages/AccountPage/AccountPage"
import CustomerPage from "../pages/CustomerPage/CustomerPage"
import FinancePage from "../pages/FinancePage/FinancePage"
import LocationPage from "../pages/LocationPage/LocationPage"
import MaidPage from "../pages/MaidPage/MaidPage"
import StaffPage from "../pages/StaffPage/StaffPage"
import SystemPage from "../pages/SystemPage/SystemPage"
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage"

// Import các component con của OrderPage
import ProcessingOrders from "../pages/OrderPage/PartPage/ProcessingOrders/ProcessingOrders";
import OrderHistory from "../pages/OrderPage/PartPage/HistoryOrders/OrderHistory";
import ShowProcessingDetail from "../pages/OrderPage/PartPage/ProcessingOrders/ShowProcessingDetail";
import ShowHistoryDetail from "../pages/OrderPage/PartPage/HistoryOrders/ShowHistoryDetail";
import AddOrder from "../pages/OrderPage/PartPage/AddOrder/AddOrder";


export const routes = [{
        path: '/',
        page: DashBoard,
        isShowHeader: true
    },
    {
        path: 'add',
        page: AddOrder,
        isShowHeader: true,
    },
    {
        path: '/order',
        page: OrderPage,
        isShowHeader: true,
        children: [{
                path: 'processing', // Route con cho đơn hàng cần xử lý
                page: ProcessingOrders,
                isShowHeader: true,

            },
            {
                path: 'history', // Route con cho lịch sử đơn hàng
                page: OrderHistory,
                isShowHeader: true,
            },
            
        ],
    },
    { //option procesing
        path: '/order/processing/showDetail',
        page: ShowProcessingDetail,
        isShowHeader: true,
    },
    { //option procesing
        path: '/order/processing/editDetail',
        page: ShowProcessingDetail,
        isShowHeader: true,
    },
    { //option history
        path: '/order/history/showDetail',
        page: ShowHistoryDetail,
        isShowHeader: true,
    },
    { //option history
        path: '/order/history/editDetail',
        page: ShowProcessingDetail,
        isShowHeader: true,
    },
    {
        path: '/account',
        page: AccountPage,
        isShowHeader: true
    },
    {
        path: '/customer',
        page: CustomerPage,
        isShowHeader: true
    },
    {
        path: '/finance',
        page: FinancePage,
        isShowHeader: true
    },
    {
        path: '/location',
        page: LocationPage,
        isShowHeader: true
    },
    {
        path: '/maid',
        page: MaidPage,
        isShowHeader: true
    },
    {
        path: '/staff',
        page: StaffPage,
        isShowHeader: true
    },
    {
        path: '/system',
        page: SystemPage,
        isShowHeader: true
    },
    {
        path: '*',
        page: NotFoundPage
    }
]