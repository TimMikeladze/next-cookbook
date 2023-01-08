import React from 'react';

export interface ButtonProps {
  label?: string;
}

const Button = (props: ButtonProps) => (
  <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
    {props.label || 'Button'}
  </button>
);
export default Button;
