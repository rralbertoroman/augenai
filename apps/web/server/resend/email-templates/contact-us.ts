import type { ContactUsTemplateProps } from "../schemas";

export function ContactUsTemplate({
  senderName,
  senderEmail,
  message,
  subject: userSubject,
}: ContactUsTemplateProps): {
  subject: string;
  html: string;
} {
  const subject = userSubject || "Nuevo mensaje de contacto";

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${subject}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 30px 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 12px 12px 0 0;
          }
          .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            background-color: #ffffff;
            padding: 40px 30px;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .info-section {
            background-color: #f3f4f6;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .info-section h3 {
            margin: 0 0 10px 0;
            color: #374151;
            font-size: 16px;
            font-weight: 600;
          }
          .info-section p {
            margin: 5px 0;
            font-size: 14px;
            color: #6b7280;
          }
          .message-box {
            background-color: #fafafa;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .message-box p {
            margin: 0;
            font-size: 15px;
            color: #374151;
            line-height: 1.7;
          }
          .label {
            font-weight: 600;
            color: #10b981;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #9ca3af;
            font-size: 13px;
            margin-top: 20px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Nuevo Mensaje de Contacto</h1>
          </div>
          <div class="content">
            <div class="info-section">
              <h3>Información del Usuario</h3>
              <p><span class="label">Nombre:</span> ${senderName}</p>
              <p><span class="label">Email:</span> <a href="mailto:${senderEmail}" style="color: #10b981; text-decoration: none;">${senderEmail}</a></p>
              ${userSubject ? `<p><span class="label">Asunto:</span> ${userSubject}</p>` : ""}
            </div>

            <div class="divider"></div>

            <h3 style="color: #374151; margin-bottom: 15px;">Mensaje:</h3>
            <div class="message-box">
              <p>${message.replace(/\n/g, "<br>")}</p>
            </div>

            <div class="divider"></div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              Este mensaje fue enviado desde el formulario de contacto de AugenAI.
            </p>
          </div>
          
          <div class="footer">
            <p>
              © ${new Date().getFullYear()} AugenAI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    subject,
    html,
  };
}
