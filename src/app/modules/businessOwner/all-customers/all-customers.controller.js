import AllCustomersService from "./all-customers.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

class AllCustomersController {
    static async getAllCustomersByBusiness(req, res) {
        try {
            const ownerId = req.user?.id;

            if (!ownerId) {
                return sendResponse(res, {
                    statusCode: 401,
                    success: false,
                    message: "Unauthorized",
                    data: null,
                });
            }

            const customers = await AllCustomersService.getAllCustomersByBusiness(ownerId);

            return sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Customers retrieved successfully",
                data: customers,
            });
        } catch (error) {
            return sendResponse(res, {
                statusCode: error.statusCode || 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async getSingleCustomer(req, res) {
        try {
            const { customerId } = req.params;

            const customer = await AllCustomersService.getSingleCustomer(customerId);

            return sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Customer retrieved successfully",
                data: customer,
            });
        } catch (error) {
            return sendResponse(res, {
                statusCode: error.statusCode || 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async deleteCustomer(req, res) {
        try {
            const { customerId } = req.params;

            await AllCustomersService.deleteCustomer(customerId);

            return sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Customer deleted successfully",
                data: null,
            });
        } catch (error) {
            return sendResponse(res, {
                statusCode: error.statusCode || 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }
}

export default AllCustomersController;
