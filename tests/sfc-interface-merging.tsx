import * as React from 'react';

export interface ComponentProps {
    /** How old you are. **/
    age: number;
}

export interface ComponentProps {
    /** Second JSDoc **/
    age: number;
    /** Your first name. **/
    firstName: string;
}

export const Component: React.SFC<ComponentProps> = ({}) => (
    <div></div>
