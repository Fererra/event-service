import { createDataSource } from "../../src/shared/infrastructure/database.config";

export default async function globalSetup() {
  const dataSource = createDataSource({
    host: process.env.TEST_DB_HOST || "localhost",
    port: Number(process.env.TEST_DB_PORT) || 5433,
    username: process.env.TEST_DB_USER || "postgres",
    password: process.env.TEST_DB_PASSWORD || "postgres",
    database: process.env.TEST_DB_NAME || "test_db",
  });

  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}
