import React from "react";
import HeadOrderPage from "./HeadOrderPage";  
import { Outlet } from "react-router-dom";


const OrderPage = () => {
  return (
    <>
      <HeadOrderPage></HeadOrderPage>
      {/* <BodyOrderPage></BodyOrderPage> */}
      <Outlet />
    </>
  );
};

export default OrderPage;