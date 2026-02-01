import CustomerCardService from "./cardsCustomer.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

class CustomerCardController {
    static async getByBusiness(req, res) {
        try {
            let { businessId } = req.params;

            // Fallback to active branch's business if businessId is missing
            if (!businessId || businessId === "active") {
                const customer = await req.prisma.customer.findUnique({
                    where: { id: req.user.id },
                    select: { activeBranchId: true }
                });

                if (customer?.activeBranchId) {
                    const branch = await req.prisma.branch.findUnique({
                        where: { id: customer.activeBranchId },
                        select: { businessId: true }
                    });
                    businessId = branch?.businessId;
                }
            }

            if (!businessId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "businessId is required or no active branch set",
                    data: null,
                });
            }

            const customerId = req.user?.id;
            const cards = await CustomerCardService.getCardsByBusiness(businessId, customerId);

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
            const { id } = req.params;
            const card = await CustomerCardService.getCardById(id);

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

    static async getMyCards(req, res) {
        try {
            const customerId = req.user.id;
            const result = await CustomerCardService.getMyCards(customerId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "My cards retrieved successfully",
                data: result,
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
}

export default CustomerCardController;
