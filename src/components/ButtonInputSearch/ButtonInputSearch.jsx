import React from "react";
import { SearchOutlined } from '@ant-design/icons'
import InputComponent from '../InputComponent/InputComponent'
import ButtonComponent from "../ButtonComponent/ButtonComponent";

const ButtonInputSearch = (props) => {
    const {
        size, placeholder, textButton,
        bordered, backgroundColorInput = '#fff',
        backgroundColorButton= '#3cbe5d',
        colorButton = '#02571c'
    } = props

    return (
        <div style={{ display: 'flex', justifyItems:'center'}}>
            <InputComponent 
                size={size}
                placeholder={placeholder}
                bordered=""
                style={{backgroundColor: backgroundColorInput, borderColor: '#02571c', marginRight: '4px'}}
            />
            <ButtonComponent
                size={size}
                styleButton={{ background: backgroundColorButton, border: !bordered && 'none'}}
                icon={<SearchOutlined color={colorButton} style={{ color: '#fff', fontSize: '20px' }} />}
                textButton={textButton}
                styleButtonText={{color: "#fff"}}
            />
        </div>
    )
}

export default ButtonInputSearch