import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";

class CustomerCardService {
    /**
     * Get all cards for a specific business
     * @param {string} businessId 
     * @returns {Promise<Array>}
     */
    static async getCardsByBusiness(businessId) {
        return prisma.card.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
        });
    }

    /**
     * Get a single card by its ID
     * @param {string} id 
     * @returns {Promise<Object>}
     */
    static async getCardById(id) {
        const card = await prisma.card.findUnique({
            where: { id },
        });

        if (!card) {
            throw new AppError(404, "Card not found");
        }

        return card;
    }
}

export default CustomerCardService;
