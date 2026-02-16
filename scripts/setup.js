const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 Starting Project Setup...');

rl.question('📦 Enter new project name (kebab-case recommended): ', (name) => {
    if (!name) {
        console.error('❌ Name is required.');
        rl.close();
        process.exit(1);
    }

    // 1. Update package.json
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = require(packageJsonPath);
        packageJson.name = name;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`✅ Updated package.json name to "${name}"`);
    } else {
        console.error('❌ package.json not found.');
    }

    // 2. Generate Auth Secret if needed
    const envPath = path.join(projectRoot, '.env');
    const envExamplePath = path.join(projectRoot, '.env.example');

    // Ensure .env exists (copy from example if needed, though we created .env directly)
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
    }

    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');


        // Check if AUTH_SECRET is missing or needs replacement
        if (!envContent.includes('AUTH_SECRET=') || envContent.includes('your-generated-secret-key')) {
            try {
                console.log('🔑 Generating AUTH_SECRET...');
                const secret = execSync('openssl rand -base64 32').toString().trim();

                if (envContent.includes('your-generated-secret-key')) {
                    envContent = envContent.replace('your-generated-secret-key', secret);
                } else {
                    // Append if completely missing
                    envContent += `\nAUTH_SECRET="${secret}"\n`;
                }

                fs.writeFileSync(envPath, envContent);
                console.log('✅ Generated new AUTH_SECRET in .env');
            } catch (e) {
                console.warn('⚠️ Failed to generate AUTH_SECRET. Please set it manually:', e);
            }
        } else {
            console.log('✅ AUTH_SECRET already exists in .env');
        }
    }

    // 3. Update package-lock.json
    console.log('🔄 Updating package-lock.json...');
    try {
        execSync('npm install', { stdio: 'inherit', cwd: projectRoot });
        console.log('✅ Dependencies updated.');
    } catch (e) {
        console.error('❌ Failed to update dependencies.', e);
    }

    console.log(`\n🎉 Project "${name}" is ready!`);
    console.log('👉 Next steps:');
    console.log('   1. Update DATABASE_URL in .env');
    console.log('   2. Run "npx prisma migrate dev"');
    console.log('   3. Run "npm run dev"');

    rl.close();
});
