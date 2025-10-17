import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function RegisterMEI(){
  const [cnpj,setCnpj] = useState('');
  return (
    <div style={{padding:30}}>
      <h2>Cadastro MEI</h2>
      <form onSubmit={(e)=>e.preventDefault()} style={{maxWidth:480}}>
        <label>CNPJ</label>
        <Input value={cnpj} onChange={e=>setCnpj(e.target.value)} />
        <label>Email</label>
        <Input type="email" />
        <label>Telefone</label>
        <Input />
        <label>Senha</label>
        <Input type="password" />
        <div style={{marginTop:12}}><Button type="submit">Cadastrar MEI</Button></div>
      </form>
    </div>
  );
}
