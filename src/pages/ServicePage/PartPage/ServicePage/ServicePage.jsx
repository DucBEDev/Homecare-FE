import React from "react";
import HeadService from "../HeadService/HeadService";
import { Outlet } from "react-router-dom";

const ServicePage = () => {
    return (
        <>
            <HeadService />
            <Outlet />
        </>
    )
}

export default ServicePage;
