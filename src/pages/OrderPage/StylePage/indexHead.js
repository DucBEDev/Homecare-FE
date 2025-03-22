import {
    Col,
    Row
} from "antd"
import styled from "styled-components"


export const WrapperHeaderText = styled.h1 `
    padding: 14px 0 14px 24px;
    margin-bottom: 24px;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    width: 100%;
     background: linear-gradient(135deg, #07BF73 0%,#17CF73 50%, #17CF83 100%);
    @media (max-width: 992px) {
        width: 110%;
        margin-left: -40px;
    }

    @media (max-width: 687px) {
        margin-left: -26px;
    }
`

export const WrapperActionRow = styled(Row)
`
    margin-left: 24px;
    color: #111;
    font-size: 16px;
    font-weight: 600;
    @media (max-width: 992px) {
        margin-left: -40px;
    }

    @media (max-width: 687px) {
        margin-left: -26px;
    }


`

export const WrapperActionCol = styled(Col)
`
    @media (max-width: 992px) {
        margin-left: -40px;
    }

    @media (max-width: 687px) {
        margin-left: -26px;
    }
        
    @media (max-width: 576px) {
        margin-top: 12px;
        margin
        width: 100px;
    }
`

export const WrapperFilterCol = styled(Col)
`
    @media (max-width: 992px) {
        margin-left: -40px;
        margin-top: 12px;
    }

    @media (max-width: 687px) {
        margin-left: -26px;
        margin-top: 12px;
    }

    @media (max-width: 576px) {
        margin-top: 12px;
        width: 100px;
    }
`

export const WrapperFilterRow = styled(Row)
`
    margin-left: 24px;
    color: #111;
    font-size: 16px;
    font-weight: 600;
`