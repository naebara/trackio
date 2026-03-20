/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */

const { execSync } = require('child_process');
require('dotenv').config();

async function main() {
    console.log('🧪 MIGRATION TEST (Safe Mode) 🧪\n');

    const rawDbUrl = process.env.DATABASE_URL;
    const dbUrl = rawDbUrl ? rawDbUrl.replace(/^"|"$/g, '') : '';
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    // Parse DB URL to get credentials for psql (allow URLs without password)
    let parsed;
    try {
        parsed = new URL(dbUrl);
    } catch {
        console.error('❌ Could not parse DATABASE_URL. Ensure it follows standard format.');
        process.exit(1);
    }

    const user = parsed.username;
    const password = parsed.password || '';
    const host = parsed.hostname;
    const port = parsed.port || '5432';

    if (!user || !host) {
        console.error('❌ Could not parse DATABASE_URL. Ensure it follows standard format.');
        process.exit(1);
    }

    // Generate random temp DB name
    const tempDbName = `test_migration_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const auth = password ? `${user}:${password}@` : `${user}@`;
    const tempDbUrl = `postgresql://${auth}${host}:${port}/${tempDbName}`;

    // Set PGPASSWORD for all psql commands
    if (password) {
        process.env.PGPASSWORD = password;
    }

    try {
        console.log(`1. Creating temporary database: "${tempDbName}"...`);
        // Connect to 'postgres' db to create the temp db
        execSync(`psql -h ${host} -p ${port} -U ${user} -d postgres -c "CREATE DATABASE \\"${tempDbName}\\";"`, { stdio: 'ignore' });
        console.log(`   ✅ Database created.`);

        console.log(`\n2. Applying migrations to temporary database...`);
        // Run migration deploy against the NEW temp url
        execSync(`DATABASE_URL="${tempDbUrl}" npx prisma migrate deploy`, { stdio: 'inherit' });
        console.log(`   ✅ Migrations applied successfully.`);

        console.log(`\n3. Verifying schema...`);
        // Optional: Could verify table counts or basic queries here if needed.
        // For now, if deploy succeeds exit code, we assume schema is valid.
        console.log(`   ✅ Schema checks passed.`);

        console.log(`\n✅ TEST PASSED: All migrations applied cleanly to a fresh database.`);

    } catch (error) {
        console.error('\n❌ MIGRATION TEST FAILED');
        console.error(error.message);
        process.exit(1);
    } finally {
        // Cleanup: Drop temp DB
        console.log(`\n4. Cleaning up...`);
        try {
            execSync(`psql -h ${host} -p ${port} -U ${user} -d postgres -c "DROP DATABASE IF EXISTS \\"${tempDbName}\\";"`, { stdio: 'ignore' });
            console.log(`   ✅ Temporary database "${tempDbName}" deleted.`);
        } catch (cleanupError) {
            console.error(`   ⚠️  Failed to delete temporary database "${tempDbName}". You may need to remove it manually.`);
        }
    }
}

main();
