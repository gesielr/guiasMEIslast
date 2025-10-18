import React, { useState } from 'react';

export default function NFSeWizard(){
  const [step,setStep] = useState(1);
  return (
    <div style={{padding:30}}>
      <h2>Emissão NFS-e</h2>
      {step===1 && (<div><p>Tomador</p><button onClick={()=>setStep(2)}>Próximo</button></div>)}
      {step===2 && (<div><p>Serviço</p><button onClick={()=>setStep(3)}>Próximo</button></div>)}
      {step===3 && (<div><p>Revisão</p><button>Emitir</button></div>)}
    </div>
  );
}
