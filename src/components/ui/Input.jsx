import React from 'react';

export default function Input(props){
  return <input {...props} style={{ padding: '10px', borderRadius: 8, border: '1px solid #e5e7eb', width: '100%', boxSizing: 'border-box' }} />;
}
