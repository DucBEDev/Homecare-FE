import DashBoard from "../pages/DashBoard/DashBoard";
import OrderPage from "../pages/OrderPage/PartPage/MainOrder/OrderPage";
import AccountPage from "../pages/AccountPage/AccountPage";
import CustomerPage from "../pages/CustomerPage/PartPage/CustomerPage/CustomerPage";
import FinancePage from "../pages/FinancePage/FinancePage";
import MaidPage from "../pages/MaidPage/PartPage/MaidPage/MaidPage";
import StaffPage from "../pages/StaffPage/PartPage/StaffPage/StaffPage";
import SystemPage from "../pages/SystemPage/SystemPage";
import PermissionPage from "../pages/PermissionPage/PermissionPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

// Import các component con của OrderPage
import ProcessingOrders from "../pages/OrderPage/PartPage/ProcessingOrders/ProcessingOrders";
import OrderHistory from "../pages/OrderPage/PartPage/HistoryOrders/OrderHistory";
import ShowProcessingDetail from "../pages/OrderPage/PartPage/ProcessingOrders/ShowProcessingDetail";
import ShowHistoryDetail from "../pages/OrderPage/PartPage/HistoryOrders/ShowHistoryDetail";
import AddOrder from "../pages/OrderPage/PartPage/AddOrder/AddOrder";
import EditProcessingDetail from "../pages/OrderPage/PartPage/ProcessingOrders/EditProcessingDetail";
//import component con cua MaidPage
import BodyMaidTable from "../pages/MaidPage/PartPage/BodyMaid/BodyMaidTable/BodyMaidTable";
import AddMaid from "../pages/MaidPage/PartPage/AddMaid/AddMaid";
//import component con cua StaffPage
import BodyStaffTable from "../pages/StaffPage/PartPage/BodyStaff/BodyStaffTable/BodyStaffTable";
//import component con cua CustomerPage
import BodyCustomerTable from "../pages/CustomerPage/PartPage/BodyCustomer/BodyCustomerTable/BodyCustomerTable";
import ListOrderCustomer from "../pages/CustomerPage/PartPage/BodyCustomer/ListOrderCustomer/ListOrderCustomer";

export const routes = [
  {
    path: "/",
    page: DashBoard,
    isShowHeader: true,
  },
  {
    path: "order/add",
    page: AddOrder,
    isShowHeader: true,
  },
  {
    path: "/order",
    page: OrderPage,
    isShowHeader: true,
    children: [
      {
        path: "processing", // Route con cho đơn hàng cần xử lý
        page: ProcessingOrders,
        isShowHeader: true,
      },
      {
        path: "history", // Route con cho lịch sử đơn hàng
        page: OrderHistory,
        isShowHeader: true,
      },
    ],
  },
  {
    //option procesing
    path: "/order/processing/showDetail",
    page: ShowProcessingDetail,
    isShowHeader: true,
  },
  {
    //option procesing
    path: "/order/processing/editDetail",
    page: EditProcessingDetail,
    isShowHeader: true,
  },
  {
    //option history
    path: "/order/history/showDetail",
    page: ShowHistoryDetail,
    isShowHeader: true,
  },
  {
    //option history
    path: "/order/history/editDetail",
    page: ShowProcessingDetail,
    isShowHeader: true,
  },
  {
    path: "/account",
    page: AccountPage,
    isShowHeader: true,
  },
  {
    path: "/customer",
    page: CustomerPage,
    isShowHeader: true,
    children: [
      {
        path: "processing", // Route con cho đơn hàng cần xử lý
        page: BodyCustomerTable,
        isShowHeader: true,
      },
    ],
  },
  {
    //option customer history
    path: "/customer/history",
    page: ListOrderCustomer,
    isShowHeader: true,
  },
  {
    path: "/finance",
    page: FinancePage,
    isShowHeader: true,
  },
  {
    path: "/permission",
    page: PermissionPage,
    isShowHeader: true,
  },
  {
    path: "/maid",
    page: MaidPage,
    isShowHeader: true,
    children: [
      {
        path: "processing", // Route con cho đơn hàng cần xử lý
        page: BodyMaidTable,
        isShowHeader: true,
      },
    ],
  },
  {
    path: "maid/add",
    page: AddMaid,
    isShowHeader: true,
  },
  {
    path: "/staff",
    page: StaffPage,
    isShowHeader: true,
    children: [
      {
        path: "processing",
        page: BodyStaffTable,
        isShowHeader: true,
      },
    ],
  },
  {
    path: "/system",
    page: SystemPage,
    isShowHeader: true,
  },
  {
    path: "*",
    page: NotFoundPage,
  },
];
