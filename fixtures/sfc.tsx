import * as react2 from 'react';

export interface ButtonProps {
    /** The color of the `Button`'s Text. **/
    color: string;
}

export const Button: react2.SFC<ButtonProps> = ({ color, children }) => (
    <button style={{ color }}>{ children }</button>
);

export default Button;