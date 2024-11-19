import React from "react";
import { HomeFilled, SmileFilled } from '@ant-design/icons';
import {
    WrapperHeaderRow,
    WrapperHeaderCol,
    WrapperHeaderText, 
    WrapperHeaderTextSmall,
    WrapperHeaderAccount,
    WrapperHeaderHome,
    WrapperHeaderTextSub,
    WrapperLogo
 } from "./style"
import Logo from '../../assets/images/onlyLogo.svg'

const HeaderComponent = () => {
    return (
        <div>
            <WrapperHeaderRow gutter={16} style={{display:'flex', justifyContent:'space-between'}}>
                
                <WrapperHeaderCol span={10} style={{display: 'flex', justifyContent:'left', alignItems:'center', gap:'4px', height:'30px'}}>
                    <WrapperLogo src={Logo} alt="" style={{color: '#fff', gap: '0px'}}/>
                    <WrapperHeaderText>HomeCare</WrapperHeaderText>
                    <WrapperHeaderTextSmall>Admin</WrapperHeaderTextSmall>
                </WrapperHeaderCol>
                <WrapperHeaderCol xl={5} lg={6} md={1} sm={2} xs={2} style={{display: 'flex', justifyContent:'left', alignItems:'center', gap:'100px'}}>
                    <WrapperHeaderHome>
                        <HomeFilled style={{fontSize: '30px'}}/>
                        <WrapperHeaderTextSub>Trang chủ</WrapperHeaderTextSub>
                    </WrapperHeaderHome>
                    <WrapperHeaderAccount>
                        <SmileFilled style={{fontSize: '30px'}}/>
                        <WrapperHeaderTextSub>Tài khoản</WrapperHeaderTextSub>
                    </WrapperHeaderAccount>
                 </WrapperHeaderCol>
            </WrapperHeaderRow>
        </div>
    )
}

export default HeaderComponent