const nodemailer = require("nodemailer");

const requiredEnvVars = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
];

const jsonResponse = (response, statusCode, payload) => {
  response.status(statusCode).json(payload);
};

const getField = (body, field) => {
  const value = body?.[field];
  return typeof value === "string" ? value.trim() : "";
};

const hasMissingConfig = () =>
  requiredEnvVars.some((envVar) => !process.env[envVar] || process.env[envVar].includes("AQUI"));

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return jsonResponse(response, 405, {
      ok: false,
      message: "Método não permitido.",
    });
  }

  if (getField(request.body, "website")) {
    return jsonResponse(response, 200, {
      ok: true,
      message: "Mensagem enviada com sucesso.",
    });
  }

  const name = getField(request.body, "name");
  const company = getField(request.body, "company");
  const email = getField(request.body, "email");
  const message = getField(request.body, "message");

  if (!name || !company || !email || !message) {
    return jsonResponse(response, 422, {
      ok: false,
      message: "Preencha todos os campos obrigatórios.",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(response, 422, {
      ok: false,
      message: "Informe um e-mail válido.",
    });
  }

  if (hasMissingConfig()) {
    return jsonResponse(response, 500, {
      ok: false,
      message: "SMTP ainda não configurado.",
    });
  }

  const smtpPort = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.isNaN(smtpPort) ? 465 : smtpPort,
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: {
        name: process.env.SMTP_FROM_NAME || "BWB Serviços",
        address: process.env.SMTP_FROM_EMAIL,
      },
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: {
        name,
        address: email,
      },
      subject: "Novo interesse pelo site BWB Serviços",
      text: [
        "Novo interesse enviado pelo site BWB Serviços.",
        "",
        `Nome: ${name}`,
        `Empresa: ${company}`,
        `E-mail: ${email}`,
        "",
        "Mensagem:",
        message,
      ].join("\n"),
    });

    return jsonResponse(response, 200, {
      ok: true,
      message: "Mensagem enviada com sucesso. A equipe BWB retornará pelo canal informado.",
    });
  } catch (error) {
    console.error("[BWB contato]", error);

    return jsonResponse(response, 500, {
      ok: false,
      message: "Não foi possível enviar a mensagem agora. Verifique a configuração SMTP e tente novamente.",
    });
  }
};
