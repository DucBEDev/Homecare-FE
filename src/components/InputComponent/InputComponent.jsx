import React from 'react'
import { Input } from 'antd'

const InputComponent = ({size, placeholder, bordered = true, style,onChange, ...rests}) => {
    const handleChange = (e) => {
        onChange && onChange(e.target.value);
    };
    return (
        <Input 
            size={size}
            placeholder={placeholder}
            bordered={bordered}
            style={style}
            onChange={handleChange}
            {...rests}
        />
    )
} 

export default InputComponent