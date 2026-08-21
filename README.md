# Atende Fácil

Bot de atendimento automático pelo navegador, sem conexão com WhatsApp. Possui construtor visual de fluxos, menus e submenus, arquivos, histórico, relatórios, widget, embed e usuários administrativos.

## Instalação em VPS

Requisitos: Ubuntu/Debian, Git, Docker Engine, plugin Docker Compose, chave SSH com acesso ao repositório e Nginx instalado no host.

```bash
git clone git@github.com:jotanuior/atendefacil.git /tmp/atendefacil-install
sudo bash /tmp/atendefacil-install/scripts/install-vps.sh
```

O instalador cria uma senha forte para o primeiro administrador, inicia o container somente em `127.0.0.1:3100` e mantém banco e arquivos em volume persistente.

Copie `deploy/nginx-atendefacil.conf.example` para `/etc/nginx/sites-available/atendefacil`, ajuste o domínio, habilite a configuração e gere o certificado HTTPS com Certbot.

## Atualização

```bash
sudo bash /opt/atendefacil/scripts/update-vps.sh
```

## Recuperação de senha

Configure no `.env`:

```env
RESEND_API_KEY=sua-chave
EMAIL_FROM=Atende Facil <atendimento@seu-dominio.com.br>
```

O link enviado pelo botão “Esqueci minha senha” expira em uma hora e só pode ser usado uma vez.

## Embed sempre maximizado

```html
<iframe src="https://seu-dominio.com.br/atendimento?widget=1"
  title="Atendimento"
  style="width:100%;height:650px;border:0;border-radius:16px">
</iframe>
```
