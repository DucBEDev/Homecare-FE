import React from "react";
import HeadMaid from "../HeadMaid/HeadMaid";
import { Outlet } from "react-router-dom";

const MaidPage = () => {
    return (
        <>
            <HeadMaid />
            <Outlet />
        </>
    )
}

export default MaidPage;
