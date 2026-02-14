import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// This script aims to help user extract PEMs if they have openssl, 
// or provides instructions if they don't.

const p12Path = "apple_wallet.p12";
const password = process.argv[2] || ""; // Pass password as argument

if (!fs.existsSync(p12Path)) {
    console.error("❌ apple_wallet.p12 not found.");
    process.exit(1);
}

console.log("Attempting to extract PEMs from apple_wallet.p12...");

try {
    // Attempt with openssl if available
    execSync(`openssl pkcs12 -in ${p12Path} -clcerts -nokeys -out signerCert.pem -passin pass:${password}`);
    execSync(`openssl pkcs12 -in ${p12Path} -nocerts -nodes -out signerKey.pem -passin pass:${password}`);
    console.log("✅ Successfully extracted signerCert.pem and signerKey.pem using openssl.");
} catch (err) {
    console.error("❌ Could not extract using openssl. Details:", err.message);
    console.log("\nManual Action Required:");
    console.log("Since openssl is not available or failed, please convert your .p12 to PEM manually:");
    console.log("1. Go to an online converter or use a machine with openssl.");
    console.log("2. Extract the Certificate as 'signerCert.pem'.");
    console.log("3. Extract the Private Key as 'signerKey.pem'.");
    console.log("4. Place both files in the root directory.");
}
