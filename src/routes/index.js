import DashBoard from "../pages/DashBoard/DashBoard"
import OrderPage from "../pages/OrderPage/OrderPage"
import AccountPage from "../pages/AccountPage/AccountPage"
import CustomerPage from "../pages/CustomerPage/CustomerPage"
import FinancePage from "../pages/FinancePage/FinancePage"
import LocationPage from "../pages/LocationPage/LocationPage"
import MaidPage from "../pages/MaidPage/MaidPage"
import StaffPage from "../pages/StaffPage/StaffPage"
import SystemPage from "../pages/SystemPage/SystemPage"
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage"

// Import các component con của OrderPage
import PendingOrders from "../pages/OrderPage/PartPage/PendingOrders";
import ProcessingOrders from "../pages/OrderPage/PartPage/ProcessingOrders";
import OrderHistory from "../pages/OrderPage/PartPage/OrderHistory";
import ShowProcessingDetail from "../pages/OrderPage/PartPage/ShowProcessingDetail";
import ShowHistoryDetail from "../pages/OrderPage/PartPage/ShowHistoryDetail";


export const routes = [
    {
        path: '/',
        page: DashBoard,
        isShowHeader: true
    },
    {
        path: '/order',
        page: OrderPage,
        isShowHeader: true,
        children: [
            {
              path: 'pending',    // Route con cho đơn hàng chưa xác định chi phí
              page: PendingOrders,
              isShowHeader: true,
            },
            {
              path: 'processing', // Route con cho đơn hàng cần xử lý
              page: ProcessingOrders,
              isShowHeader: true,
              
            },
            {
              path: 'history',    // Route con cho lịch sử đơn hàng
              page: OrderHistory,
              isShowHeader: true,
            },
          ],
    },
    {//option procesing
        path: '/order/processing/showProcessingDetail',
        page: ShowProcessingDetail,
        isShowHeader: true,
    },
    { //option history
        path: '/order/history/showHistoryDetail',
        page: ShowHistoryDetail,
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