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
import BlogPage from "../pages/BlogPage/BlogPage/BlogPage";

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
import AddStaff from "../pages/StaffPage/PartPage/AddStaff/AddStaff"
import StaffBusySchedule from "../pages/StaffPage/PartPage/BodyStaff/StaffBusySchedule/StaffBusySchedule.jsx";
import EditMaid from "../pages/MaidPage/PartPage/EditMaid/EditMaid"
import MaidBusySchedule from "../pages/MaidPage/PartPage/BodyMaid/MaidBusySchedule/MaidBusySchedule.jsx"
//import component con cua CustomerPage
import BodyCustomerTable from "../pages/CustomerPage/PartPage/BodyCustomer/BodyCustomerTable/BodyCustomerTable";
import ListOrderCustomer from "../pages/CustomerPage/PartPage/BodyCustomer/ListOrderCustomer/ListOrderCustomer";
//import component con cua BlogPage
import BodyBlog from "../pages/BlogPage/BodyBlog/BodyBlog";
import AddBlog from "../pages/BlogPage/AddPage/AddBlog.jsx";
import ViewBlog from "../pages/BlogPage/ViewPage/ViewPage";
//import component con cua ServicePage
import ServicePage from "../pages/ServicePage/PartPage/ServicePage/ServicePage";
import BodyServiceTable from "../pages/ServicePage/PartPage/BodyService/BodyServiceTable";
import LoginComponent from "../components/LoginComponent/LoginComponent.jsx";

export const routes = [
  {
    path: "/",
    page: DashBoard,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "order/add",
    page: AddOrder,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/order",
    page: OrderPage,
    isShowHeader: true,
    isProtected: true,
    children: [
      {
        path: "processing", // Route con cho đơn hàng cần xử lý
        page: ProcessingOrders,
        isShowHeader: true,
        isProtected: true,
      },
      {
        path: "history", // Route con cho lịch sử đơn hàng
        page: OrderHistory,
        isShowHeader: true,
        isProtected: true,
      },
    ],
  },
  {
    //option procesing
    path: "/order/processing/showDetail",
    page: ShowProcessingDetail,
    isShowHeader: true,
    isProtected: true,
  },
  {
    //option procesing
    path: "/order/processing/editDetail",
    page: EditProcessingDetail,
    isShowHeader: true,
    isProtected: true,
  },
  {
    //option history
    path: "/order/history/showDetail",
    page: ShowHistoryDetail,
    isShowHeader: true,
    isProtected: true,
  },
  {
    //option history
    path: "/order/history/editDetail",
    page: ShowProcessingDetail,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/account",
    page: AccountPage,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/blog",
    page: BlogPage,
    isShowHeader: true,
    isProtected: true,
    children: [
      {
        path: "processing", // Route con cho đơn hàng cần xử lý
        page: BodyBlog,
        isShowHeader: true,
        isProtected: true,
      },
    ],
  },
  {
    path: "blog/add",
    page: AddBlog,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "blog/view",
    page: ViewBlog,
    isShowHeader: true, 
    isProtected: true,
  },
  {
    path: "/customer",
    page: CustomerPage,
    isShowHeader: true,
    isProtected: true,
    children: [
      {
        path: "processing", // Route con cho đơn hàng cần xử lý
        page: BodyCustomerTable,
        isShowHeader: true,
        isProtected: true,
      },
    ],
  },
  {
    //option customer history
    path: "/customer/history",
    page: ListOrderCustomer,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/services",
    page: ServicePage,
    isShowHeader: true,
    isProtected: true,
    children: [
      {
        path: "processing", // Route con cho đơn hàng cần xử lý
        page: BodyServiceTable,
        isShowHeader: true,
        isProtected: true,
      },
    ],
  },
  {
    path: "/finance",
    page: FinancePage,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/permission",
    page: PermissionPage,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/maid",
    page: MaidPage,
    isShowHeader: true,
    isProtected: true,
    children: [
      {
        path: "processing", // Route con cho đơn hàng cần xử lý
        page: BodyMaidTable,
        isShowHeader: true,
        isProtected: true,
      },
    ],
  },
  {
    path: "maid/add",
    page: AddMaid,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/maid/processing/editDetail",
    page: EditMaid,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/maid/processing/schedule",
    page: MaidBusySchedule,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/staff",
    page: StaffPage,
    isShowHeader: true,
    isProtected: true,
    children: [
      {
        path: "processing",
        page: BodyStaffTable,
        isShowHeader: true, 
        isProtected: true,
      },
    ],
  },
  {
    path: "staff/add",
    page: AddStaff,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/staff/processing/schedule",
    page: StaffBusySchedule,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/system",
    page: SystemPage,
    isShowHeader: true,
    isProtected: true,
  },
  {
    path: "/login",
    page: LoginComponent,
    isShowHeader: false,
    isProtected: false,
  },
  {
    path: "*",
    page: NotFoundPage,
  },
];
