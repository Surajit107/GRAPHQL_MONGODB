/**
 * Email template for enabling two-factor authentication
 */
export const qrCodeEmailTemplate = ({
  username,
  qrCodeUrl,
  secret,
}: {
  username: string;
  qrCodeUrl: string;
  secret: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Two-Factor Authentication Setup</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
          margin-bottom: 20px;
        }
        .qr-code {
          text-align: center;
          margin: 20px 0;
        }
        .qr-code img {
          max-width: 200px;
        }
        .secret-key {
          background-color: #eee;
          padding: 10px;
          border-radius: 3px;
          font-family: monospace;
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #777;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Two-Factor Authentication Setup</h2>
        </div>
        
        <p>Hello ${username},</p>
        
        <p>You've successfully enabled two-factor authentication for your account. To complete the setup, please scan the QR code below with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).</p>
        
        <div class="qr-code">
          <img src="${qrCodeUrl}" alt="QR Code for 2FA">
        </div>
        
        <p>If you can't scan the QR code, you can manually enter this secret key in your authenticator app:</p>
        
        <div class="secret-key">
          ${secret}
        </div>
        
        <p><strong>Important:</strong> Keep this secret key safe. You'll need it if you ever lose access to your authenticator app.</p>
        
        <p>After scanning the QR code or entering the secret key, your authenticator app will generate a 6-digit code that changes every 30 seconds. You'll need to enter this code when logging in to verify your identity.</p>
      </div>
      
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>If you did not request this change, please contact support immediately.</p>
      </div>
    </body>
    </html>
  `;
};