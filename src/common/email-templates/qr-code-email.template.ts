export function qrCodeEmailTemplate({ userName, qrCodeUrl, secret }: { userName: string; qrCodeUrl: string; secret: string }) {
  return `
  <div style="background: #0f2027; background: linear-gradient(135deg, #2c5364 0%, #203a43 50%, #0f2027 100%); padding: 40px; color: #fff; font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif; border-radius: 16px; max-width: 480px; margin: auto; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);">
    <h2 style="text-align: center; letter-spacing: 2px; font-weight: 700; margin-bottom: 24px;">Enable Two-Factor Authentication</h2>
    <p style="font-size: 1.1em; margin-bottom: 24px; text-align: center;">Hi <b>${userName}</b>,<br>Scan the QR code below with your authenticator app to enable secure 2FA on your account.</p>
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="${qrCodeUrl}" alt="2FA QR Code" style="border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.25); width: 220px; height: 220px; background: #fff; padding: 12px;" />
    </div>
    <p style="text-align: center; font-size: 1em; color: #fff; margin-bottom: 16px;">If you cannot scan the QR code, enter this secret manually in your app:</p>
    <div style="text-align: center; font-size: 1.2em; font-weight: bold; letter-spacing: 2px; color: #ffd700; margin-bottom: 24px;">${secret}</div>
    <p style="text-align: center; font-size: 0.95em; color: #b0b0b0;">If you did not request this, please ignore this email or contact support.</p>
    <div style="margin-top: 32px; text-align: center;">
      <span style="font-size: 0.85em; color: #888;">&copy; ${new Date().getFullYear()} YourAppName. All rights reserved.</span>
    </div>
  </div>
  `;
} 