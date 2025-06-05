"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.write2FAHtmlFile = write2FAHtmlFile;
// src/utils/write2FAHtmlFile.ts
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function write2FAHtmlFile(qrCodeBase64, userId) {
    const publicDir = path_1.default.join(__dirname, '..', '..', 'public', '2fa');
    await promises_1.default.mkdir(publicDir, { recursive: true });
    const filePath = path_1.default.join(publicDir, `2fa-${userId}.html`);
    const cssContent = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap');

body {
  margin: 20px;
  background: radial-gradient(circle at center, #0f0f13 0%, #050507 90%);
  font-family: 'Orbitron', sans-serif;
  color: #00fff7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  user-select: none;
}

h1 {
  font-size: 3rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 40px;
  color: #00fff7;
  text-shadow:
    0 0 8px #00fff7,
    0 0 20px #00fff7,
    0 0 40px #00fff7;
  animation: flicker 3s infinite;
}

#qrCodeImg {
  width: 320px;
  height: 320px;
  border-radius: 24px;
  box-shadow:
    0 0 15px #00fff7,
    0 0 40px #00fff7 inset,
    0 0 80px #00fff7;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
}

#qrCodeImg:hover {
  box-shadow:
    0 0 25px #00fff7,
    0 0 70px #00fff7 inset,
    0 0 120px #00fff7;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

@keyframes flicker {

  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    opacity: 1;
    text-shadow:
      0 0 8px #00fff7,
      0 0 20px #00fff7,
      0 0 40px #00fff7;
  }

  20%, 22%, 24%, 55% {
    opacity: 0.7;
    text-shadow: none;
  }
}
`;
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>2FA QR Code</title>
  <style>
    ${cssContent}
  </style>
</head>
<body>
  <h1>Scan this 2FA QR Code</h1>
  <img id="qrCodeImg" src="${qrCodeBase64}" alt="2FA QR Code" />
</body>
</html>`;
    await promises_1.default.writeFile(filePath, htmlContent, 'utf8');
    // Return URL path to the HTML file (to be combined with your server base URL)
    return `/2fa/2fa-${userId}.html`;
}
