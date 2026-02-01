import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../../utils/sendResponse.js";
import { BusinessProfileService } from "./businessProfile.service.js";

const getProfile = async (req, res, next) => {
    try {
        const businessId = req.user.businessId; // Attached by businessScope middleware
        const userId = req.user.id; // From authMiddleware

        const result = await BusinessProfileService.getProfile(req.prisma, businessId, userId);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Business profile retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const userId = req.user.id;

        const updateData = { ...req.body };

        // 🖼️ HANDLE BUSINESS LOGO UPLOAD
        if (req.file) {
            const logoPath = req.file.path.replace(/\\/g, "/");
            const baseUrl = `${req.protocol}://${req.get("host")}`;

            updateData.businessLogo = req.file.filename;
            updateData.businessLogoFilePath = logoPath;
            updateData.businessLogoUrl = `${baseUrl}/${logoPath}`;
        }

        const result = await BusinessProfileService.updateProfile(req.prisma, businessId, userId, updateData);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Business profile updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const BusinessProfileController = {
    getProfile,
    updateProfile
};
