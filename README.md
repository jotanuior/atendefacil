# Atende Fácil

Bot de atendimento automático pelo navegador, sem conexão com WhatsApp. Possui construtor visual de fluxos, menus e submenus, arquivos, histórico, relatórios, widget, embed e usuários administrativos.

## Instalação em VPS

Requisitos: Ubuntu/Debian, Git, Docker Engine, plugin Docker Compose, chave SSH com acesso ao repositório e Nginx instalado no host.

```bash
git clone git@github.com:jotanuior/atendefacil.git /tmp/atendefacil-install
sudo bash /tmp/atendefacil-install/scripts/install-vps.sh
```

O instalador cria uma senha forte para o primeiro administrador, procura automaticamente uma porta livre a partir da `3100`, grava a porta em `.env` e mantém banco e arquivos em volume persistente.

Copie `deploy/nginx-atendefacil.conf.example` para `/etc/nginx/sites-available/atendefacil`, ajuste a porta e habilite a configuração. Por padrão, o acesso será `http://172.29.3.35/atendefacil/`.

O bloco específico `location ^~ /atendefacil/assets/` é obrigatório. Ele encaminha os arquivos CSS e JavaScript para `/assets/` no container, evitando erro 404 ao hospedar o sistema em uma subpasta.

O `wrangler.jsonc` já publica `dist/client` como diretório de assets. Depois de atualizar essa configuração, reconstrua a imagem Docker para que o arquivo seja copiado para o container.

## Atualização

```bash
sudo bash /opt/atendefacil/scripts/update-vps.sh
```

## Recuperação de senha por SMTP

Configure no `.env`:

```env
APP_BASE_PATH=/atendefacil
APP_PUBLIC_URL=http://172.29.3.35/atendefacil
SMTP_HOST=mail.seu-dominio.com.br
SMTP_PORT=587
SMTP_SECURE=false
SMTP_STARTTLS=true
SMTP_USER=atendimento@seu-dominio.com.br
SMTP_PASSWORD=senha-da-conta
SMTP_FROM=Atende Facil <atendimento@seu-dominio.com.br>
```

Use `SMTP_PORT=465`, `SMTP_SECURE=true` e `SMTP_STARTTLS=false` para SSL direto. Para porta 587, mantenha os valores do exemplo. O link enviado pelo botão “Esqueci minha senha” expira em uma hora e só pode ser usado uma vez.

## Embed sempre maximizado

```html
<iframe src="http://172.29.3.35/atendefacil/atendimento?widget=1"
  title="Atendimento"
  style="width:100%;height:650px;border:0;border-radius:16px">
</iframe>
```
