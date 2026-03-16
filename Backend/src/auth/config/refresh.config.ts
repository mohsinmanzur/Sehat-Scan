import { registerAs } from "@nestjs/config";
import { JwtSignOptions } from "@nestjs/jwt";

export default registerAs('refresh', (): JwtSignOptions => ({
    
    secret: process.env.REFRESH_SECRET,
    expiresIn: !process.env.REFRESH_EXPIRES_IN as any
}));