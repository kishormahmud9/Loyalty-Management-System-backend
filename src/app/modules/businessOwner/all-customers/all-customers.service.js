import { PrismaClient } from "@prisma/client";
import { AppError } from "../../../errorHelper/appError.js";

const prisma = new PrismaClient();

class AllCustomersService {
    /**
     * Get all customers registered with any business owned by the logged-in user
     * @param {string} ownerId 
     * @returns {Promise<Array>}
     */
    static async getAllCustomersByBusiness(ownerId) {
        if (!ownerId) {
            throw new AppError(401, "Unauthorized");
        }

        // 1. Find all businesses owned by this user
        const businesses = await prisma.business.findMany({
            where: { ownerId },
            select: { id: true }
        });

        if (businesses.length === 0) {
            return [];
        }

        const businessIds = businesses.map(b => b.id);

        // 2. Fetch customers unique to these businesses through the CustomerBranchData relation
        const customersData = await prisma.customerBranchData.findMany({
            where: {
                businessId: { in: businessIds },
            },
            select: {
                createdAt: true, // Joining date to business
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
        });

        // Extract unique customers from the relationship data
        const uniqueCustomersMap = new Map();
        customersData.forEach((item) => {
            if (item.customer && !uniqueCustomersMap.has(item.customer.id)) {
                uniqueCustomersMap.set(item.customer.id, {
                    id: item.customer.id,
                    name: item.customer.name,
                    email: item.customer.email,
                    registeredDate: item.createdAt, // Date joined the business
                });
            }
        });

        return Array.from(uniqueCustomersMap.values());
    }

    /**
     * Get a single customer by ID
     * @param {string} customerId 
     * @returns {Promise<Object>}
     */
    static async getSingleCustomer(customerId) {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                branchData: {
                    include: {
                        business: true,
                        branch: true
                    }
                }
            }
        });

        if (!customer) {
            throw new AppError(404, "Customer not found");
        }

        return customer;
    }

    /**
     * Delete a customer record
     * @param {string} customerId 
     * @returns {Promise<Object>}
     */
    static async deleteCustomer(customerId) {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        if (!customer) {
            throw new AppError(404, "Customer not found");
        }

        await prisma.customerBranchData.deleteMany({
            where: { customerId }
        });

        return await prisma.customer.delete({
            where: { id: customerId }
        });
    }
}

export default AllCustomersService;
