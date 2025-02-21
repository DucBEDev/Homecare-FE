import React from "react";
import HeadBlog from "../HeadBlog/HeadBlog";
import { Outlet } from "react-router-dom";

const BlogPage = () => {
    return (
        <>
            <HeadBlog />
            <Outlet />
        </>
    )
}

export default BlogPage;
