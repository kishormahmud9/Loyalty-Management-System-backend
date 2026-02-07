import fs from "fs";
import path from "path";

function checkCert(filename) {
    const filePath = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ ${filename} does not exist.`);
        return;
    }

    const buffer = fs.readFileSync(filePath);
    console.log(`Checking ${filename} (${buffer.length} bytes)...`);

    // Basic check for DER/PKCS12 format (starts with 0x30 0x82)
    if (buffer[0] === 0x30 && buffer[1] === 0x82) {
        console.log(`✅ ${filename} has a valid DER/PKCS12 header (0x3082).`);
    } else {
        console.warn(`⚠️ ${filename} does not have a standard DER/PKCS12 header. First bytes: ${buffer.slice(0, 2).toString('hex')}`);
    }
}

console.log("Certificate Integrity Check:");
checkCert("apple_wallet.p12");
checkCert("pass.cer");
