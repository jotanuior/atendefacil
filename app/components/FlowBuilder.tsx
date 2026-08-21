"use client";
import {useEffect,useMemo,useState} from "react";
import {appPath} from "../lib/paths";

type Kind="message"|"menu"|"image"|"video"|"audio"|"pdf"|"link"|"input"|"team"|"hours"|"end";
type Option={id:string;label:string;target:string};
type Node={id:string;title:string;kind:Kind;text:string;url?:string;caption?:string;next?:string;options?:Option[];team?:string;required?:boolean};
type Flow={startId:string;nodes:Node[]};
const kinds:{kind:Kind;icon:string;name:string;help:string}[]=[
 {kind:"message",icon:"💬",name:"Enviar texto",help:"Uma mensagem simples"},
 {kind:"menu",icon:"☷",name:"Mostrar opções",help:"Menu ou submenu"},
 {kind:"image",icon:"🖼️",name:"Enviar imagem",help:"Foto com legenda"},
 {kind:"video",icon:"▶️",name:"Enviar vídeo",help:"Vídeo com legenda"},
 {kind:"audio",icon:"🎧",name:"Enviar áudio",help:"Mensagem de voz"},
 {kind:"pdf",icon:"📄",name:"Enviar PDF",help:"Manual ou documento"},
 {kind:"link",icon:"🔗",name:"Abrir um link",help:"Site, formulário ou mapa"},
 {kind:"input",icon:"⌨️",name:"Fazer pergunta",help:"Guardar uma resposta"},
 {kind:"team",icon:"🏷️",name:"Classificar atendimento",help:"Organizar no histórico"},
 {kind:"hours",icon:"🕐",name:"Verificar horário",help:"Aberto ou fechado"},
 {kind:"end",icon:"✓",name:"Finalizar",help:"Encerrar e avaliar"}
];
const initial:Flow={startId:"welcome",nodes:[
 {id:"welcome",title:"Boas-vindas",kind:"message",text:"Olá! 👋 Como podemos ajudar você hoje?",next:"main"},
 {id:"main",title:"Menu principal",kind:"menu",text:"Escolha uma opção:",options:[
  {id:"o1",label:"Atendimento geral",target:"general"},{id:"o2",label:"Financeiro",target:"finance"},
  {id:"o3",label:"Suporte técnico",target:"support"},{id:"o4",label:"Outros assuntos",target:"team"}
 ]},
 {id:"general",title:"Atendimento geral",kind:"menu",text:"Certo! O que você deseja?",options:[{id:"g1",label:"Consultar informações",target:"info"},{id:"g2",label:"Falar com atendente",target:"team"},{id:"g3",label:"↩ Voltar ao menu",target:"main"}]},
 {id:"finance",title:"Financeiro",kind:"menu",text:"Como podemos ajudar no financeiro?",options:[{id:"f1",label:"Segunda via",target:"pdf"},{id:"f2",label:"Formas de pagamento",target:"info"},{id:"f3",label:"↩ Voltar",target:"main"}]},
 {id:"support",title:"Suporte técnico",kind:"input",text:"Conte em poucas palavras o que está acontecendo:",next:"team",required:true},
 {id:"info",title:"Informações",kind:"message",text:"Aqui está a informação que você solicitou.",next:"main"},
 {id:"pdf",title:"Enviar documento",kind:"pdf",text:"Segue o documento solicitado:",url:"https://exemplo.com/documento.pdf",caption:"Baixar documento",next:"main"},
 {id:"team",title:"Classificar atendimento",kind:"team",text:"Pronto! Registrei seu atendimento nesta categoria.",team:"Atendimento",next:"end"},
 {id:"end",title:"Finalizar",kind:"end",text:"Atendimento finalizado. Obrigado por conversar com a gente!"}
]};

export default function FlowBuilder(){
 const[flow,setFlow]=useState<Flow>(initial),[selected,setSelected]=useState("main"),[showTypes,setShowTypes]=useState(false);
 const[saving,setSaving]=useState(false),[published,setPublished]=useState(false),[test,setTest]=useState(false);
 useEffect(()=>{fetch(appPath("/api/admin/flow")).then(r=>r.ok?r.json():null).then(d=>d?.flow?.config&&setFlow(d.flow.config)).catch(()=>{})},[]);
 const node=useMemo(()=>flow.nodes.find(n=>n.id===selected)??flow.nodes[0],[flow,selected]);
 const patch=(changes:Partial<Node>)=>setFlow(f=>({...f,nodes:f.nodes.map(n=>n.id===selected?{...n,...changes}:n)}));
 async function upload(file?:File){if(!file)return;const form=new FormData();form.append("file",file);setSaving(true);const r=await fetch(appPath("/api/admin/upload"),{method:"POST",body:form});const d=await r.json();setSaving(false);if(r.ok)patch({url:d.url,caption:node.caption||d.name});else alert(d.error||"Não foi possível enviar o arquivo.")}
 async function save(publish=false){setSaving(true);const r=await fetch(appPath("/api/admin/flow"),{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({name:"Fluxo principal",config:flow,publish})});setSaving(false);if(r.ok&&publish)setPublished(true)}
 function addNode(kind:Kind){const meta=kinds.find(k=>k.kind===kind)!;const id=`${kind}-${Date.now()}`;const created:Node={id,title:meta.name,kind,text:kind==="menu"?"Escolha uma opção:":kind==="input"?"Digite sua resposta:":kind==="team"?"Atendimento classificado com sucesso.":kind==="end"?"Atendimento finalizado. Obrigado!":"Digite aqui a mensagem.",options:kind==="menu"?[{id:`o-${Date.now()}`,label:"Nova opção",target:flow.startId}]:undefined};setFlow(f=>({...f,nodes:[...f.nodes,created]}));setSelected(id);setShowTypes(false)}
 function duplicate(){const id=`${node.kind}-${Date.now()}`;setFlow(f=>({...f,nodes:[...f.nodes,{...node,id,title:`${node.title} (cópia)`,options:node.options?.map(o=>({...o,id:`${o.id}-c`}))}]}));setSelected(id)}
 function remove(){if(node.id===flow.startId)return;setFlow(f=>({...f,nodes:f.nodes.filter(n=>n.id!==node.id).map(n=>({...n,next:n.next===node.id?flow.startId:n.next,options:n.options?.map(o=>o.target===node.id?{...o,target:flow.startId}:o)}))}));setSelected(flow.startId)}
 return <div className="flow-builder">
  <header className="flow-top"><div><small>CONSTRUTOR DO BOT</small><h1>Monte seu atendimento</h1><p>Escolha o que o bot faz e para onde a pessoa vai depois.</p></div><section><em>{saving?"Salvando...":"✓ Alterações prontas"}</em><button className="light" onClick={()=>setTest(true)}>▶ Testar fluxo</button><button className="light" onClick={()=>save(false)}>Salvar</button><button className="primary" onClick={()=>save(true)}>{published?"✓ Publicado":"Publicar bot"}</button></section></header>
  {published&&<div className="flow-success">✓ <span><b>Fluxo publicado!</b><small>Os visitantes já receberão este novo atendimento.</small></span><button onClick={()=>setPublished(false)}>×</button></div>}
  <div className="flow-grid">
   <aside className="flow-map">
    <header><div><b>Seu fluxo</b><small>{flow.nodes.length} etapas configuradas</small></div><button onClick={()=>setShowTypes(true)}>＋</button></header>
    <div className="flow-tree">{flow.nodes.map((n,i)=>{const meta=kinds.find(k=>k.kind===n.kind)!;return <button key={n.id} className={selected===n.id?"active":""} onClick={()=>setSelected(n.id)}><i>{meta.icon}</i><span><small>{n.id===flow.startId?"INÍCIO":`ETAPA ${i+1}`}</small><b>{n.title}</b><em>{meta.name}</em></span><strong>›</strong></button>})}</div>
    <button className="flow-add" onClick={()=>setShowTypes(true)}>＋ Adicionar uma etapa</button>
   </aside>
   <section className="flow-editor">
    <header><div><i>{kinds.find(k=>k.kind===node.kind)?.icon}</i><span><small>VOCÊ ESTÁ EDITANDO</small><input value={node.title} onChange={e=>patch({title:e.target.value})}/></span></div><nav><button onClick={duplicate}>⧉ Duplicar</button><button className="red" onClick={remove}>⌫ Excluir</button></nav></header>
    <div className="easy-note"><b>Em português simples:</b> o bot executa esta etapa e depois segue o destino escolhido abaixo.</div>
    <label>O bot vai dizer:</label><textarea rows={4} value={node.text} onChange={e=>patch({text:e.target.value})} placeholder="Escreva como se estivesse falando com a pessoa"/>
    {(node.kind==="image"||node.kind==="video"||node.kind==="audio"||node.kind==="pdf"||node.kind==="link")&&<div className="media-fields"><label>{node.kind==="image"?"Endereço da imagem":node.kind==="video"?"Endereço do vídeo":node.kind==="audio"?"Endereço do áudio":node.kind==="pdf"?"Endereço do PDF":"Endereço do link"}</label><input value={node.url||""} onChange={e=>patch({url:e.target.value})} placeholder="https://..."/><label>Nome do botão ou legenda</label><input value={node.caption||""} onChange={e=>patch({caption:e.target.value})} placeholder={node.kind==="pdf"?"Baixar documento":"Abrir conteúdo"}/>{node.kind!=="link"&&<label className="upload-box"><i>↑</i><span><b>Envie o arquivo aqui</b><small>Imagem, vídeo, áudio ou PDF • até 25 MB</small></span><strong>Escolher arquivo</strong><input type="file" accept={node.kind==="image"?"image/*":node.kind==="video"?"video/*":node.kind==="audio"?"audio/*":"application/pdf"} onChange={e=>upload(e.target.files?.[0])}/></label>}</div>}
    {node.kind==="menu"?<OptionsEditor node={node} nodes={flow.nodes} patch={patch}/>:node.kind==="team"?<><label>Em qual categoria guardar?</label><select value={node.team||"Atendimento"} onChange={e=>patch({team:e.target.value})}><option>Atendimento</option><option>Financeiro</option><option>Suporte técnico</option><option>Fila geral</option></select></>:node.kind==="input"?<div className="input-config"><label><input type="checkbox" checked={node.required??true} onChange={e=>patch({required:e.target.checked})}/> A resposta é obrigatória</label><p>O sistema guardará a resposta no histórico do atendimento.</p></div>:node.kind==="hours"?<div className="hours-box"><span>🟢 Se estiver aberto → <b>Continuar o fluxo automático</b></span><span>🌙 Se estiver fechado → <b>Mostrar mensagem de ausência</b></span></div>:null}
    {node.kind!=="menu"&&node.kind!=="end"&&<><hr/><label>Depois desta etapa:</label><select value={node.next||""} onChange={e=>patch({next:e.target.value})}><option value="">Parar aqui</option>{flow.nodes.filter(n=>n.id!==node.id).map(n=><option value={n.id} key={n.id}>{n.id===flow.startId?"↩ Menu inicial":n.title}</option>)}</select></>}
    <div className="editor-footer"><span>💡 Você pode mudar tudo depois.</span><button className="primary" onClick={()=>setShowTypes(true)}>＋ Adicionar próxima etapa</button></div>
   </section>
   <aside className="flow-preview"><header><b>Veja como ficou</b><small>Atualiza na hora</small></header><FlowPhone flow={flow} reset={test} onReset={()=>setTest(false)}/></aside>
  </div>
  {showTypes&&<div className="type-modal" onMouseDown={()=>setShowTypes(false)}><section onMouseDown={e=>e.stopPropagation()}><header><div><h2>O que o bot fará agora?</h2><p>Escolha uma opção. Você poderá configurar tudo na próxima tela.</p></div><button onClick={()=>setShowTypes(false)}>×</button></header><div className="type-grid">{kinds.map(k=><button key={k.kind} onClick={()=>addNode(k.kind)}><i>{k.icon}</i><span><b>{k.name}</b><small>{k.help}</small></span><strong>›</strong></button>)}</div></section></div>}
 </div>
}

function OptionsEditor({node,nodes,patch}:{node:Node;nodes:Node[];patch:(x:Partial<Node>)=>void}){
 const options=node.options||[];
 function change(id:string,values:Partial<Option>){patch({options:options.map(o=>o.id===id?{...o,...values}:o)})}
 return <div className="option-editor"><div className="option-title"><label>Botões que a pessoa verá:</label><small>Cada botão pode levar para um lugar diferente</small></div>{options.map((o,i)=><article key={o.id}><b>{i+1}</b><div><label>Texto do botão</label><input value={o.label} onChange={e=>change(o.id,{label:e.target.value})}/></div><div><label>Quando clicar, vá para</label><select value={o.target} onChange={e=>change(o.id,{target:e.target.value})}>{nodes.filter(n=>n.id!==node.id).map(n=><option value={n.id} key={n.id}>{n.title}{n.id==="welcome"?" (menu inicial)":""}</option>)}</select></div><button onClick={()=>patch({options:options.filter(x=>x.id!==o.id)})}>×</button></article>)}<button className="new-option" onClick={()=>patch({options:[...options,{id:`o-${Date.now()}`,label:"Nova opção",target:nodes.find(n=>n.id!==node.id)?.id||""}]})}>＋ Adicionar outro botão</button></div>
}

function FlowPhone({flow,reset,onReset}:{flow:Flow;reset:boolean;onReset:()=>void}){
 const[current,setCurrent]=useState(flow.startId),[history,setHistory]=useState<string[]>([]),[input,setInput]=useState("");const node=flow.nodes.find(n=>n.id===current)||flow.nodes[0];
 useEffect(()=>{if(reset){setCurrent(flow.startId);setHistory([]);onReset()}},[reset,flow.startId,onReset]);
 function go(id?:string,label?:string){if(label)setHistory(h=>[...h,label]);if(id)setCurrent(id)}
 function body(){if(node.kind==="menu")return <><div className="preview-bubble">{node.text}</div><div className="preview-options">{node.options?.map(o=><button key={o.id} onClick={()=>go(o.target,o.label)}>{o.label}</button>)}</div></>;if(node.kind==="image")return <><div className="media-mock image">🖼️<small>Imagem</small></div><div className="preview-bubble">{node.text}</div></>;if(node.kind==="video")return <><div className="media-mock video">▶<small>Vídeo</small></div><div className="preview-bubble">{node.text}</div></>;if(node.kind==="pdf")return <div className="file-mock">📄 <span><b>{node.caption||"Documento.pdf"}</b><small>PDF • toque para abrir</small></span></div>;if(node.kind==="audio")return <div className="audio-mock">▶ ━━━━━ 0:24</div>;if(node.kind==="team")return <><div className="preview-bubble">{node.text}</div><div className="queue-mock">🏷️ Categoria: {node.team}</div></>;if(node.kind==="input")return <><div className="preview-bubble">{node.text}</div><div className="preview-input"><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Digite aqui"/><button onClick={()=>{setHistory(h=>[...h,input]);setInput("");go(node.next)}}>➤</button></div></>;return <div className="preview-bubble">{node.text}</div>}
 return <div className="flow-phone"><div className="phone-bar"/><header><i>A</i><span><b>Atendimento</b><small>● online agora</small></span><button onClick={()=>{setCurrent(flow.startId);setHistory([])}}>↻</button></header><main><small>HOJE</small>{history.slice(-2).map((h,i)=><div className="preview-user" key={i}>{h}</div>)}{body()}{node.kind!=="menu"&&node.kind!=="input"&&node.next&&<button className="continue" onClick={()=>go(node.next)}>Continuar →</button>}</main></div>
}
