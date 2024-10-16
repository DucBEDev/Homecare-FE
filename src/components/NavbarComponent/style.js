import styled from "styled-components"
import {
  Menu
} from 'antd'

export const StyledMenu = styled(Menu)
`
  display: flex;
  flex-direction: column;
  height: 800px;
  width: 100%;
  background-color: #f0f2f5;
  margin-top: 90px;
  color: #fff;
  overflow: hidden;

  .ant-menu-item {
    display: flex !important;
    align-items: center !important;
    padding: 26px 20px !important;
    font-size: 26px !important;
    font-weight: 300 !important;
    margin: 4px 0 !important;
    transition: all ease-in-out 0.2s !important;
  }

  .ant-menu-item-icon {
     font-size: 22px !important;
     margin-right: 8px;
  }

  .ant-menu-item-selected {
    background-color: #28A562;
    color: #fff;
    width: 100%;
  }

  .ant-menu-item-danger.ant-menu-item-selected {
    background-color: #FFB2B0; 
    color: #fff; 
}

  .ant-menu-item:nth-of-type(1) {
    display: none !important;
  }


  @media (max-width: 992px) {
    width: 60%;

    .ant-menu-title-content {
      display: none !important;
    }
 
    .ant-menu-item {
      justify-content: center !important;
      width: 100%;
      // position: relative !important;
    }

    .ant-menu-item-icon {
      margin-left: 6px;
      font-size: 28px !important;
    }

    .ant-menu-item:nth-of-type(1) {
      margin-bottom: 20px !important;
      display: flex !important;
      justify-content: center !important;
      width: 100%;
    }
    .ant-menu-item:nth-of-type(1) .ant-menu-item-icon {
      font-size: 30px !important;
      margin-right: 8px;
    }
    
  }

  @media (max-width: 576px) {

    .ant-menu-item {
      padding: 20px 20px !important;
    }

  }

  @media (max-width: 421px) {
    .ant-menu-item {
      padding: 10px 10px !important;
    }
  }

`;