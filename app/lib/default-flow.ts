export const defaultFlow={startId:"welcome",nodes:[
 {id:"welcome",title:"Boas-vindas",kind:"message",text:"Olá! 👋 Como podemos ajudar você hoje?",next:"main"},
 {id:"main",title:"Menu principal",kind:"menu",text:"Escolha uma opção:",options:[{id:"o1",label:"Atendimento geral",target:"general"},{id:"o2",label:"Financeiro",target:"finance"},{id:"o3",label:"Suporte técnico",target:"support"},{id:"o4",label:"Outros assuntos",target:"category"}]},
 {id:"general",title:"Atendimento geral",kind:"menu",text:"Certo! O que você deseja?",options:[{id:"g1",label:"Consultar informações",target:"info"},{id:"g2",label:"Deixar meus dados",target:"contact"},{id:"g3",label:"↩ Voltar ao menu",target:"main"}]},
 {id:"finance",title:"Financeiro",kind:"menu",text:"Como podemos ajudar no financeiro?",options:[{id:"f1",label:"Formas de pagamento",target:"payment"},{id:"f2",label:"Deixar meus dados",target:"contact"},{id:"f3",label:"↩ Voltar",target:"main"}]},
 {id:"support",title:"Suporte técnico",kind:"input",text:"Conte em poucas palavras o que está acontecendo:",next:"category",required:true},
 {id:"info",title:"Informações",kind:"message",text:"Aqui você pode colocar todas as informações necessárias, inclusive links como https://exemplo.com.",next:"main"},
 {id:"payment",title:"Formas de pagamento",kind:"message",text:"Configure aqui as formas de pagamento aceitas.",next:"main"},
 {id:"contact",title:"Coletar contato",kind:"input",text:"Digite seu nome, telefone ou e-mail para registrar no protocolo:",next:"category",required:true},
 {id:"category",title:"Classificar atendimento",kind:"team",text:"Pronto! Seu atendimento foi registrado automaticamente.",team:"Atendimento",next:"end"},
 {id:"end",title:"Finalizar",kind:"end",text:"Atendimento finalizado. Obrigado!"}
]};
