import CardService from "./cards.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

class CardController {
    static async create(req, res) {
        try {
            const userId = req.user?.id;
            const { businessId } = req.user;

            if (!businessId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "Business ID is missing from your profile",
                    data: null,
                });
            }

            // 🖼️ MULTIPLE IMAGE HANDLING
            const imageFields = [
                "logo",
                "cardBackground",
                "stampBackground",
                "activeStamp",
                "inactiveStamp",
            ];
            const imageUrls = {};

            if (req.files) {
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                imageFields.forEach((field) => {
                    if (req.files[field] && req.files[field][0]) {
                        const filePath = req.files[field][0].path.replace(/\\/g, "/");
                        imageUrls[field] = `${baseUrl}/${filePath}`;

                        if (field === "logo") imageUrls.logoFilePath = filePath;
                        if (field === "stampBackground")
                            imageUrls.stampBackgroundPath = filePath;
                    }
                });
            }

            const card = await CardService.createCard({
                ...req.body,
                ...imageUrls,
                userId,
                businessId: req.body.businessId || businessId,
            });

            return sendResponse(res, {
                statusCode: 201,
                success: true,
                message: "Card created successfully",
                data: card,
            });
        } catch (error) {
            return sendResponse(res, {
                statusCode: error.statusCode || 400,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async getByBusiness(req, res) {
        try {
            const { businessId } = req.user;
            const businessIdFromQuery = req.query.businessId;
            const targetBusinessId = businessIdFromQuery || businessId;

            if (!targetBusinessId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "Business ID is required",
                    data: null,
                });
            }

            const cards = await CardService.getCardsByBusiness(targetBusinessId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Cards retrieved successfully",
                data: cards,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async getOne(req, res) {
        try {
            const card = await CardService.getCardById(req.params.id);
            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Card retrieved successfully",
                data: card,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: error.statusCode || 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id;
            const userId = req.user?.id;

            // 🖼️ MULTIPLE IMAGE HANDLING
            const imageFields = [
                "logo",
                "cardBackground",
                "stampBackground",
                "activeStamp",
                "inactiveStamp",
            ];
            const imageUrls = {};

            if (req.files) {
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                imageFields.forEach((field) => {
                    if (req.files[field] && req.files[field][0]) {
                        const filePath = req.files[field][0].path.replace(/\\/g, "/");
                        imageUrls[field] = `${baseUrl}/${filePath}`;

                        if (field === "logo") imageUrls.logoFilePath = filePath;
                        if (field === "stampBackground")
                            imageUrls.stampBackgroundPath = filePath;
                    }
                });
            }

            const updatedCard = await CardService.updateCard(id, {
                ...req.body,
                ...imageUrls,
                userId,
            });

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Card updated successfully",
                data: updatedCard,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 400,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async remove(req, res) {
        try {
            const userId = req.user?.id;
            await CardService.deleteCard(req.params.id, userId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Card deleted successfully",
                data: null,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }
}

export default CardController;
