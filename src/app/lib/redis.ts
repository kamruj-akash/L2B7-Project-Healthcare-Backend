import { createClient } from "redis";
import config from "../config";

export const redisClient = createClient({
	username: config.redis_user,
	password: config.redis_pass,
	socket: {
		host: config.redis_host,
		port: Number(config.redis_port),
	},
	// url: "https://direct-mongrel-78482.upstash.io",
	// token: "gQAAAAAAATKSAAIgcDJmZTJhZWVlOTg1ZmM0ODYwODBlZTEwYWRjMDJjYWVkNQ",
});
