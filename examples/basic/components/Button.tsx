import React from 'react';

export interface ButtonProps {
  label?: string;
}

const Button = (props: ButtonProps) => {
  return <button>{props.label || `Click me`}</button>;
};

export default Button;
