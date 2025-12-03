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
  const subject = "Te han compartido una predicción - AugenAI";

  // 3D Logo with Side Shapes
  const logoHtml = `
    <div style="text-align: center;">
      <div style="display: inline-block; vertical-align: middle; width: 32px; height: 64px; background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%); border-radius: 32px 3px 3px 32px; margin-right: 12px; box-shadow: 0 8px 16px rgba(110, 231, 183, 0.3), inset 0 2px 4px rgba(255,255,255,0.3);"></div>
      <div style="display: inline-block; vertical-align: middle; width: 64px; height: 64px; background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%); border-radius: 50%; margin-right: 12px; box-shadow: 0 8px 16px rgba(110, 231, 183, 0.3), inset 0 2px 4px rgba(255,255,255,0.3);"></div>
      <div style="display: inline-block; vertical-align: middle; width: 32px; height: 64px; background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%); border-radius: 3px 32px 32px 3px; box-shadow: 0 8px 16px rgba(110, 231, 183, 0.3), inset 0 2px 4px rgba(255,255,255,0.3);"></div>
    </div>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #111813;
            background-color: #f2f4f3;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: #f2f4f3;
            padding: 60px 0;
          }
          .container {
            max-width: 560px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 32px;
            overflow: hidden;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0,0,0,0.02);
          }
          .header {
            padding: 48px 48px 32px;
            text-align: center;
            background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
          }
          .content {
            padding: 0 48px 64px;
          }
          .section-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #9ca3af;
            font-weight: 700;
            margin-bottom: 16px;
            display: block;
            padding-left: 4px;
          }
          .user-card {
            background-color: #f9fafb;
            border: 1px solid #edf2f0;
            border-radius: 24px;
            padding: 24px;
            margin-bottom: 40px;
            display: flex;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
          }
          .user-info {
            flex: 1;
          }
          .user-name {
            font-size: 18px;
            font-weight: 700;
            color: #111813;
            margin: 0 0 4px 0;
            letter-spacing: -0.3px;
          }
          .user-email {
            font-size: 14px;
            color: #61896f;
            text-decoration: none;
            font-weight: 500;
          }
          .message-box {
            background-color: #f9fafb;
            border: 1px solid #edf2f0;
            border-radius: 24px;
            padding: 40px 32px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            text-align: center;
          }
          .message-text {
            font-size: 17px;
            color: #374151;
            margin: 0 0 32px;
            line-height: 1.7;
            font-weight: 500;
          }
          .button {
            display: inline-block;
            padding: 18px 56px;
            background: linear-gradient(180deg, #6ee7b7 0%, #34d399 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 100px;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.2s ease;
            box-shadow: 0 8px 20px rgba(110, 231, 183, 0.35), inset 0 1px 0 rgba(255,255,255,0.2);
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(110, 231, 183, 0.45), inset 0 1px 0 rgba(255,255,255,0.2);
          }
          .footer {
            padding: 40px;
            background-color: #fafbfc;
            text-align: center;
            border-top: 1px solid #f0f2f1;
          }
          .footer-text {
            font-size: 13px;
            color: #9ca3af;
            margin: 0;
            line-height: 1.6;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              ${logoHtml}
              <h2 style="margin: 28px 0 0; font-size: 22px; font-weight: 700; color: #111813; letter-spacing: -0.5px;">Predicción Compartida</h2>
            </div>
            <div class="content">
              
              <span class="section-label">Compartido por</span>
              <div class="user-card">
                <div class="user-info">
                  <h3 class="user-name">${senderName}</h3>
                  <a href="mailto:${senderEmail}" class="user-email">${senderEmail}</a>
                </div>
              </div>

              <span class="section-label">Mensaje</span>
              <div class="message-box">
                <p class="message-text">
                  ${recipientName ? `Hola <strong>${recipientName}</strong>, ` : "Hola, "}<br>
                  Te invito a revisar esta predicción generada por AugenAI.
                </p>
                <a href="${predictionUrl}" class="button">
                  Ver Predicción
                </a>
              </div>

            </div>
            
            <div class="footer">
              <p class="footer-text">
                Este correo fue enviado automáticamente por AugenAI.<br>
                © ${new Date().getFullYear()} AugenAI. Todos los derechos reservados.
              </p>
            </div>
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
