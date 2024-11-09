import React from "react";
import HeadStaff from "../HeadStaff/HeadStaff";
import { Outlet } from "react-router-dom";

const StaffPage = () => {
    return (
        <>
            <HeadStaff />
            <Outlet />
        </>
    )
}

export default StaffPage;
