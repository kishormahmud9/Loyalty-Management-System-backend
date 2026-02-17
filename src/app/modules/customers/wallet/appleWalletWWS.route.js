import express from "express";
import AppleWalletWWSController from "./appleWalletWWS.controller.js";

const router = express.Router();

/**
 * Apple Wallet Web Service (WWS) Protocol Endpoints
 * Note: These endpoints MUST follow Apple's required path structure exactly.
 * The basePath should be  (or whatever is set in the webServiceURL property in pass.json)
 */

// Device Registration
router.post(
    "/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber",
    AppleWalletWWSController.registerDevice
);

// Device Unregistration
router.delete(
    "/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber",
    AppleWalletWWSController.unregisterDevice
);

// List Updated Passes
router.get(
    "/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier",
    AppleWalletWWSController.getUpdatedPasses
);

// Get Latest Pass
router.get(
    "/passes/:passTypeIdentifier/:serialNumber",
    AppleWalletWWSController.getLatestPass
);

// Logging endpoint (Optional but recommended by Apple)
router.post("/log", (req, res) => {
    console.log("Apple Wallet Log:", req.body);
    res.status(200).send();
});

export const AppleWalletWWSRoutes = router;
