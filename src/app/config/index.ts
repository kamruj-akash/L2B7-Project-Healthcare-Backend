import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
	node_env: process.env.NODE_ENV,
	port: process.env.PORT,
	database_url: process.env.DATABASE_URL,
	bak_url: process.env.APP_URL,
	frontend_url: process.env.FRONTEND_URL,
	bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS as string,
	jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
	jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
	jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN as string,
	jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN as string,
	gClient_id: process.env.GOOGLE_CLIENT_ID as string,
	gClient_secret: process.env.GOOGLE_CLIENT_SECRET as string,
	gRedirect_url: process.env.GOOGLE_REDIRECT_URL as string,
};
