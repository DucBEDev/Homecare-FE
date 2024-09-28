import React from 'react'
import { Button } from 'antd'

const ButtonComponent = ({size, styleButton, styleButtonText, textButton, ...rests}) => {

    return (
        <Button
            size={size}
            style={styleButton}
            {...rests}
        >
            <span style={styleButtonText}>{textButton}</span>
        </Button>
    )
} 

export default ButtonComponent