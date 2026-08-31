import cron from "node-cron";
import app from "./app";
import config from "./app/config";
import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";
import { seedSuperAdminAndDoctor } from "./app/utils/seed";

const PORT = config.port;

const main = async () => {
	try {
		await prisma.$connect();
		await redisClient.connect();
		await seedSuperAdminAndDoctor();
		console.log("Connected to the database successfully.");

		cron.schedule("0 0 * * *", async () => {
			console.log("Running daily cleanup task...");
		});
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Error starting the server:", error);
		await prisma.$disconnect();
		process.exit(1);
	}
};

main();
