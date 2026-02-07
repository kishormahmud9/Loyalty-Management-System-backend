import dotenv from "dotenv";
dotenv.config();
import { appleWalletService } from "../src/app/modules/customers/wallet/appleWallet.service.js";
import fs from "fs";

async function verifyAppleWallet() {
    console.log("Starting Apple Wallet Pass Generation Verification...");

    const dummyCard = {
        companyName: "Test Business",
        cardDesc: "Test Loyalty Program",
        textColor: "#FFFFFF",
        cardBackground: "#000000",
        logoFilePath: "uploads/test-logo.png" // Might not exist
    };

    const dummyData = {
        serialNumber: "test_customer_test_card",
        customerId: "test_customer_id",
        customerName: "John Doe",
        points: 150
    };

    try {
        console.log("Attempting to generate pass buffer...");
        const buffer = await appleWalletService.generatePass(dummyData, dummyCard);

        if (buffer && buffer.length > 0) {
            console.log("✅ Success! .pkpass buffer generated. Size:", buffer.length, "bytes");
            // fs.writeFileSync("test-pass.pkpass", buffer);
            // console.log("Saved test-pass.pkpass for manual inspection.");
        } else {
            console.error("❌ Failure: Generated buffer is empty.");
        }
    } catch (error) {
        console.error("❌ Error during pass generation:", error.message);
        if (error.message.includes("certificate")) {
            console.log("Note: This failure is expected if valid certificates (p12/WWDR) are not present in the environment.");
        }
    }
}

verifyAppleWallet();
