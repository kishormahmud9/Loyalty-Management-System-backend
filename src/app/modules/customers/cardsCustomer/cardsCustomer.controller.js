import CustomerCardService from "./cardsCustomer.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

class CustomerCardController {
    static async getByBusiness(req, res) {
        try {
            const { businessId } = req.params;
            const cards = await CustomerCardService.getCardsByBusiness(businessId);

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
}

export default CustomerCardController;
