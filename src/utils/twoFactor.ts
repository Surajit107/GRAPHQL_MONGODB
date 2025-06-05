import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export const generate2FASecret = (email: string) => {
    return speakeasy.generateSecret({ name: `GraphQLApp (${email})` });
};

export const getQRCode = async (otpauth_url: string): Promise<string> => {
    return await qrcode.toDataURL(otpauth_url);
};

export const verify2FAToken = (token: string, secret: string) => {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1,
    });
};