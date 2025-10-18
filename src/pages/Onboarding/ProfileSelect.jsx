import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileSelect(){
  const nav = useNavigate();
  return (
    <div style={{padding:40,fontFamily:'Inter, sans-serif'}}>
      <h1>Escolha seu perfil</h1>
      <div style={{display:'flex',gap:20,marginTop:20}}>
        <div style={{padding:20,background:'#fff',borderRadius:8,cursor:'pointer'}} onClick={()=>nav('/cadastro/mei')}>🧍‍♂️ MEI</div>
        <div style={{padding:20,background:'#fff',borderRadius:8,cursor:'pointer'}} onClick={()=>nav('/cadastro/autonomo')}>💼 Autônomo</div>
        <div style={{padding:20,background:'#fff',borderRadius:8,cursor:'pointer'}} onClick={()=>nav('/cadastro/parceiro')}>👥 Parceiro</div>
      </div>
    </div>
  );
}
