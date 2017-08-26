import * as react2 from 'react';

export interface ButtonProps {
    /** The color of the `Button`'s Text. **/
    color: string;
}

/**
 * Doc comment on component.
 **/
export const Button: react2.SFC<ButtonProps> = ({ color, children }) => (
    <button style={{ color }}>{ children }</button>
);


// single line comment
/**
 * Another JSDoc
 **/
/**
 * Doc comment on component.
 * 
 * And another line
 **/
export const Button2: react2.SFC<ButtonProps> = ({ color, children }) => (
    <button style={{ color }}>{ children }</button>
);

/**
 * @export
 * @type {React.SFC<ButtonProps>}
 * @author rozzzly
 **/
export const Button3: react2.SFC<ButtonProps> = ({ color, children }) => (
    <button style={{ color }}>{ children }</button>
);


export default Button;