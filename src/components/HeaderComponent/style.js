import {
    Col,
    Row
} from "antd"
import styled from "styled-components"

export const WrapperHeaderRow = styled(Row)
`
    margin: 0 !important;
    padding: 24px 0 24px 36px;
    border-radius: 4px;
    position: fixed;
    width: 100%;
    z-index: 1;
     background: linear-gradient(135deg, #07BF73 0%,#17CF73 50%, #17CF83 100%);

    @media (max-width: 1480px) {
        padding-right: 50px
    }
`

export const WrapperHeaderCol = styled(Col)
`
    margin: 0 20px;
`

export const WrapperLogo = styled.img `
    width: 40px;
    height: 40px;
    padding: 0;
    margin: 0;
`

export const WrapperHeaderText = styled.span `
    font-size: 28px;
    color: #eeeeee;
    font-weight: bold;
    position: relative;

    @media (max-width: 1200px) {
        font-size: 22px;
    }

    @media (max-width: 992px) {
        font-size: 20px;
    }
`

export const WrapperHeaderTextSmall = styled.span `
    font-size: 12px;
    color: #eeeeee;
    position: absolute;
    top: 0px;
    left: 198px;

    @media (max-width: 1200px) {
        font-size: 8px;
        top: 4px;
        left: 188px;
    }
`

export const WrapperHeaderTextSub = styled.span `
    font-size: 14px;
    font-weight: 400;
    white-space: nowrap;

    @media (max-width: 1200px) {
        font-size: 12px;
    }

    @media (max-width: 992px) {
        display: none;
    }
`

export const WrapperHeaderAccount = styled.div `
    display: flex;
    align-items: center;
    color: #eeeeee;
    gap: 6px;

    @media (max-width: 576px) {
        display: none;
    }
`

export const WrapperHeaderHome = styled.div `
    color: #eeeeee;
    display: flex;
    align-items: center;
    gap: 6px;

    @media (max-width: 992px) {
        margin-right: -76px;
    }

    @media (max-width: 576px) {
        display: none;
    }
`