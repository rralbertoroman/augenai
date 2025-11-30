import type { PredictionSharedTemplateProps } from "../schemas";

export function PredictionSharedTemplate({
  senderName,
  senderEmail,
  recipientName,
  predictionUrl,
}: PredictionSharedTemplateProps): {
  subject: string;
  html: string;
} {
  const subject = "Te han compartido una predicción";

  // const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  // const logoUrl = `${appUrl}/augen-full.svg`;

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
            background-color: #D1FAE5;          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;

          }
          .header {
            text-align: center;
            padding: 20px 20px 8px 20px;
            background-color: #ffffff;
            border-radius: 12px 12px 0 0;
          }
          .brand-accent {
            height: 6px;
            background: #2bee6c;
            border-radius: 6px 6px 0 0;
            margin-bottom: 8px;
          }
          .logo {
            max-width: 220px;
            height: auto;
            display: block;
            margin: 0 auto 6px auto;
          }
          .header h1 {
            margin: 0;
            color: #111813;
            font-size: 18px;
            font-weight: 700;
          }
          .content {
            background-color: #ffffff;
            padding: 40px 30px;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          .highlight {
            color: #111813;
            font-weight: 700;
          }
          /* Force links inside message/highlight to be black (email clients may auto-link emails) */
          .message a,
          .message a:link,
          .message a:visited,
          .highlight a,
          .highlight a:link,
          .highlight a:visited {
            color: #111813 !important;
            text-decoration: none !important;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 28px;
            background: #2bee6c;
            color: #4b5563;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 6px 16px rgba(45, 189, 95, 0.18);
          }
          .button:active {
            transform: translateY(1px);
          }
          .info-box {
            background-color: #f3f4f6;
            border-left: 4px solid #2bee6c;
            padding: 16px 20px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .info-box p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: gray;
            font-size: 13px;
            margin-top: 20px;
          }
          .footer a {
            color: #2bee6c;
            text-decoration: none;
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
            <h1 style="color:#2bee6c; font-size: 36px; font-weight: 700;">AugenAI</h1>
            <h1>Predicción Compartida</h1>
          </div>
          <div class="content">
            ${recipientName ? `<p class="greeting">Hola ${recipientName},</p>` : '<p class="greeting">Hola,</p>'}
            
            <p class="message">
              <span class="highlight">${senderName}</span> (<span class="highlight">${senderEmail}</span>) ha compartido una predicción contigo.
              Esta predicción podría ser de tu interés y está disponible para que la revises.
            </p>

            <div class="info-box">
              <p>
                <strong>Tip:</strong> Puedes revisar los detalles completos de la predicción, 
                incluyendo análisis y resultados, haciendo clic en el botón de abajo.
              </p>
            </div>

            <div class="button-container">
              <a
                href="${predictionUrl}"
                style="display:inline-block;padding:12px 28px;background:#2bee6c;color:#111813 !important;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;box-shadow:0 6px 16px rgba(45,189,95,0.18);-webkit-text-size-adjust:none;-ms-text-size-adjust:none;"
              >
                Ver Predicción →
              </a>
            </div>

            <div class="divider"></div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;text-align: center;">
              Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
            </p>
          </div>
          
          <div class="footer">
            <p>
              Este correo fue enviado porque alguien compartió una predicción contigo.<br>
              Si no esperabas este correo, puedes ignorarlo de forma segura.
            </p>
            <p style="margin-top: 15px;">
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
