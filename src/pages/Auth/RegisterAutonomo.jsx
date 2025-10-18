import React from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function RegisterAutonomo(){
  return (
    <div style={{padding:30}}>
      <h2>Cadastro Autônomo</h2>
      <form onSubmit={(e)=>e.preventDefault()} style={{maxWidth:480}}>
        <label>CPF</label>
        <Input />
        <label>Nº PIS</label>
        <Input />
        <label>Email</label>
        <Input type="email" />
        <label>Telefone</label>
        <Input />
        <label>Senha</label>
        <Input type="password" />
        <div style={{marginTop:12}}><Button type="submit">Cadastrar Autônomo</Button></div>
      </form>
    </div>
  );
}
