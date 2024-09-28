import React from "react";
import HeaderComponent from "../HeaderComponent/HeaderComponent";
import ButtonInputSearch from "../ButtonInputSearch/ButtonInputSearch";
import NavbarComponent from "../NavbarComponent/NavbarComponent";
import { Row, Col } from "antd";

const DefaultComponent = ({children}) => {
    return (
        <div>
            <HeaderComponent />
            <Row style={{display:'flex', flexDirection:'row'}}>
                <Col span={4}><NavbarComponent /></Col>
                <Col span={20}>{children}</Col>
            </Row>
        </div>
    )
}

export default DefaultComponent


      