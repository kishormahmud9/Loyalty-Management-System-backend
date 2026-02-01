import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";

/**
 * Get business profile along with owner details
 */
const getProfile = async (prismaClient, businessId, userId) => {
    try {
        console.log(`🚀 [BUSINESS_PROFILE] Fetching profile for business: ${businessId} | owner: ${userId}`);

        const business = await prismaClient.business.findUnique({
            where: { id: businessId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                        avatarUrl: true
                    }
                }
            }
        });

        if (!business) {
            throw new AppError(404, "Business not found.");
        }

        return business;
    } catch (error) {
        console.error(`🛑 [BUSINESS_PROFILE_ERROR] Error fetching profile:`, error);
        throw error;
    }
};

/**
 * Update business profile and owner details in a single transaction
 */
const updateProfile = async (prismaClient, businessId, userId, updateData) => {
    try {
        console.log(`🚀 [BUSINESS_PROFILE] Updating profile for business: ${businessId}`);

        const result = await prismaClient.$transaction(async (tx) => {
            // 1. Separate business data and owner data
            const businessUpdate = {};
            const ownerUpdate = {};

            if (updateData.name) businessUpdate.name = updateData.name;
            if (updateData.address) businessUpdate.address = updateData.address;
            if (updateData.city) businessUpdate.city = updateData.city;
            if (updateData.country) businessUpdate.country = updateData.country;
            if (updateData.phone) businessUpdate.phone = updateData.phone;

            // Branding/Logo fields
            if (updateData.businessLogo) businessUpdate.businessLogo = updateData.businessLogo;
            if (updateData.businessLogoFilePath) businessUpdate.businessLogoFilePath = updateData.businessLogoFilePath;
            if (updateData.businessLogoUrl) businessUpdate.businessLogoUrl = updateData.businessLogoUrl;

            // 2. Owner (User) data
            if (updateData.ownerName) ownerUpdate.name = updateData.ownerName;
            if (updateData.ownerEmail) ownerUpdate.email = updateData.ownerEmail;
            if (updateData.ownerPhone) ownerUpdate.phone = updateData.ownerPhone;

            // 3. Perform Updates
            const updatedBusiness = await tx.business.update({
                where: { id: businessId },
                data: businessUpdate,
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            address: true
                        }
                    }
                }
            });

            if (Object.keys(ownerUpdate).length > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: ownerUpdate
                });
            }

            return updatedBusiness;
        });

        console.log(`✅ [BUSINESS_PROFILE] Profile updated successfully for business: ${businessId}`);
        return result;

    } catch (error) {
        console.error(`🛑 [BUSINESS_PROFILE_ERROR] Update failed:`, error);
        throw error;
    }
};

export const BusinessProfileService = {
    getProfile,
    updateProfile
};
