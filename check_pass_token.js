import prisma from './src/app/prisma/client.js';

async function checkPass() {
    const sn = '5cec46e8-3a9d-40e8-9692-adf9825598e0_9b7be425-d239-43d4-9971-3797598ccf41';
    try {
        const pass = await prisma.applePass.findUnique({
            where: { serialNumber: sn }
        });
        console.log('--- DATABASE RECORD ---');
        console.log(JSON.stringify(pass, null, 2));
        console.log('--- END ---');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkPass();
