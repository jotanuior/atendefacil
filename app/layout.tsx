import type {Metadata} from "next";import "./globals.css";import "./text-format.css";
export const metadata:Metadata={title:"Atende Fácil",description:"Atendimento online simples, humano e independente do WhatsApp.",icons:{icon:"/favicon.svg"}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
