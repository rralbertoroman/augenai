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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: #667eea;
            font-weight: 600;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
          }
          .info-box {
            background-color: #f3f4f6;
            border-left: 4px solid #667eea;
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
            color: #9ca3af;
            font-size: 13px;
            margin-top: 20px;
          }
          .footer a {
            color: #667eea;
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
                💡 <strong>Tip:</strong> Puedes revisar los detalles completos de la predicción, 
                incluyendo análisis y resultados, haciendo clic en el botón de abajo.
              </p>
            </div>

            <div class="button-container">
              <a href="${predictionUrl}" class="button">
                Ver Predicción →
              </a>
            </div>

            <div class="divider"></div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
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
