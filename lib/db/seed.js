import { createClient } from "@libsql/client";

async function main() {
  console.log("🌱 Starting database seed (Pure JS)...");

  // Validate env variables
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error(
      "❌ Faltan las credenciales TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en el archivo .env",
    );
  }

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    // 1. Setup Basic App Settings for AI
    const defaultSettings = [
      { key: "ai_enabled", value: "true" },
      { key: "ai_provider", value: "gemini" },
      { key: "ai_model", value: "gemini-3.5-flash" },
      { key: "ai_max_questions", value: "20" },
      { key: "ai_daily_limit", value: "10" },
      { key: "site_name", value: "Questify" },
    ];

    console.log("⚙️ Seeding app settings...");
    for (const setting of defaultSettings) {
      await client.execute({
        sql: `INSERT INTO app_settings (key, value, updated_at) 
              VALUES (?, ?, cast(unixepoch('subsecond') * 1000 as integer)) 
              ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = cast(unixepoch('subsecond') * 1000 as integer)`,
        args: [setting.key, setting.value, setting.value],
      });
    }

    console.log("👤 Checking for registered users...");
    const userResult = await client.execute(
      "SELECT id, email FROM user LIMIT 1",
    );
    const firstUser = userResult.rows[0];

    if (!firstUser) {
      throw new Error(
        "❌ No hay ningún usuario registrado. Por favor, regístrate en la aplicación primero antes de correr el seed, para poder convertirte en administrador.",
      );
    }

    console.log(
      `👑 Making user ${firstUser.email} an admin with an active PRO subscription...`,
    );
    await client.execute({
      sql: `UPDATE user SET role = 'admin', plan = 'pro' WHERE id = ?`,
      args: [firstUser.id],
    });

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
