import { registerAs } from "@nestjs/config";

export default registerAs("googleOAuth", () => ({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://sehatscan-abgtfbb6cmgmgugr.uaenorth-01.azurewebsites.net/auth/google/callback",
}));