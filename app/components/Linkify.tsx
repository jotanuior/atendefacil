import {Fragment} from "react";
const urlPattern=/((?:https?:\/\/|www\.)[^\s<]+)/gi;
const trailing=/[.,;:!?\)\]\}]+$/;
export default function Linkify({text}:{text:string}){
 const parts=text.split(urlPattern);
 return <>{parts.map((part,index)=>{
  if(!/^(?:https?:\/\/|www\.)/i.test(part))return <Fragment key={index}>{part}</Fragment>;
  const suffix=part.match(trailing)?.[0]||"";
  const clean=suffix?part.slice(0,-suffix.length):part;
  const href=/^www\./i.test(clean)?`https://${clean}`:clean;
  return <Fragment key={index}><a className="auto-link" href={href} target="_blank" rel="noopener noreferrer">{clean}</a>{suffix}</Fragment>;
 })}</>;
}
