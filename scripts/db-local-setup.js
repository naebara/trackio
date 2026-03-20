/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log('🐘 Local PostgreSQL Setup (No Docker)\n');
    console.log('This script will help you create a local Postgres user and database.');
    console.log('It uses "psql" command. Ensure you have PostgreSQL installed locally.\n');

    try {
        // 1. Get Database Credentials
        const dbUser = await question('Enter DB Username (default: app_user): ') || 'app_user';
        const dbPass = await question('Enter DB Password (default: app_password): ') || 'app_password';
        const dbName = await question('Enter DB Name (default: myapp_local): ') || 'myapp_local';

        console.log('\n🔄 Creating User and Database...');

        // Create User (ignore if exists)
        try {
            execSync(`psql -c "CREATE USER ${dbUser} WITH PASSWORD '${dbPass}' CREATEDB;" postgres`, { stdio: 'ignore' });
            console.log(`✅ User "${dbUser}" created.`);
        } catch (e) {
            console.log(`ℹ️  User "${dbUser}" might already exist (skipped).`);
        }

        // Create Database (ignore if exists)
        try {
            execSync(`psql -c "CREATE DATABASE ${dbName} OWNER ${dbUser};" postgres`, { stdio: 'ignore' });
            console.log(`✅ Database "${dbName}" created.`);

            // Enable Extensions (requires superuser)
            console.log(`🔌 Enabling extensions...`);
            execSync(`psql -d ${dbName} -c "CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE EXTENSION IF NOT EXISTS unaccent;"`, { stdio: 'ignore' });
            console.log(`✅ Extensions enabled.`);
        } catch (e) {
            console.log(`ℹ️  Database "${dbName}" might already exist (skipped creation).`);
            // Try enabling extensions anyway in case they are missing
            try {
                execSync(`psql -d ${dbName} -c "CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE EXTENSION IF NOT EXISTS unaccent;"`, { stdio: 'ignore' });
                console.log(`✅ Extensions verified.`);
            } catch (extError) {
                console.log(`⚠️  Could not enable extensions. Ensure you have permissions.`);
            }
        }

        // 2. Update .env
        const envPath = path.join(__dirname, '..', '.env');
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

        // Construct new connection string
        // NOTE: Prisma 7 puts this in prisma.config.ts usually, but it reads from env.
        const dbUrl = `postgresql://${dbUser}:${dbPass}@localhost:5432/${dbName}?schema=public`;

        if (envContent.includes('DATABASE_URL=')) {
            envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${dbUrl}"`);
        } else {
            envContent += `\nDATABASE_URL="${dbUrl}"`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log(`\n✅ Updated .env with DATABASE_URL="${dbUrl}"`);

        console.log('\n🎉 Local Database Setup Complete!');
        console.log('👉 Next step: Run "npx prisma migrate deploy" to create tables.');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.message.includes('Command failed')) {
            console.error('   Ensure "psql" is in your PATH and PostgreSQL is running.');
        }
    } finally {
        rl.close();
    }
}

main();
