import * as React from 'react';
import { Component, PropTypes as FooBar } from 'react';

export interface ButtonProps {
    /** The color of the `Button`'s Text. **/
    color: string;
}

export const Button: React.SFC<ButtonProps> = ({ color, children }) => (
    <button style={{ color }}>{ children }</button>
);

export default Button;