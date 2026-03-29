import { Image, useColorScheme } from 'react-native'
import React from 'react'

const lightlogo = require('../../assets/Blank.png')
const darklogo = require('../../assets/Blank.png')

export const ThemedLogo = ({...props}) => {
    const colorScheme = useColorScheme() ?? 'dark';
    const logo = colorScheme === 'light' ? lightlogo: darklogo;
  return (
    <Image source= {logo} {...props}/>
  )
}