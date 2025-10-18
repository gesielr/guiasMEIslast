import React from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function TwoFactor(){
  const nav = useNavigate();
  return (
    <div style={{padding:30}}>
      <h2>Autenticação em 2 passos</h2>
      <form onSubmit={(e)=>{e.preventDefault(); nav('/dashboard');}} style={{maxWidth:480}}>
        <label>Insira o código</label>
        <Input />
        <div style={{marginTop:12}}><Button type="submit">Verificar</Button></div>
      </form>
    </div>
  );
}
