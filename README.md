# BWB Serviços landing page

Primeiro esboço estático da landing page da BWB Serviços.

## Como abrir

Abra `index.html` diretamente no navegador.

## Estrutura

- `index.html`: conteúdo e seções da página.
- `styles.css`: identidade visual, responsividade e layout.
- `script.js`: menu móvel e envio do formulário de contato.
- `api/contact.js`: Vercel Function para enviar mensagens do formulário por SMTP.
- `.env.example`: exemplo das variáveis de ambiente necessárias.
- `assets/`: imagem extraída do documento institucional enviado.

## Formulário de contato

O formulário depende das variáveis de ambiente abaixo configuradas na Vercel em
Project Settings > Environment Variables:

- `SMTP_HOST`: servidor SMTP informado pela Hostinger, normalmente `smtp.hostinger.com`.
- `SMTP_PORT`: porta SMTP, normalmente `465` para SSL.
- `SMTP_SECURE`: `true` para porta `465`; use `false` se trocar para `587`.
- `SMTP_USER`: e-mail completo usado para autenticar.
- `SMTP_PASS`: senha da conta de e-mail.
- `SMTP_FROM_EMAIL`: remetente autorizado pelo SMTP.
- `SMTP_FROM_NAME`: nome exibido no remetente.
- `CONTACT_TO_EMAIL`: destino das mensagens do formulário.

Depois de criar ou alterar variáveis na Vercel, faça um novo deploy para que a Function use os valores atualizados.
