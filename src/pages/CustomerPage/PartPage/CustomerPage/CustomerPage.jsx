import React from "react";
import HeadCustomer from "../HeadCustomer/HeadCustomer";
import { Outlet } from "react-router-dom";

const CustomerPage = () => {
    return (
        <>
            <HeadCustomer />
            <Outlet />
        </>
    )
}

export default CustomerPage;
