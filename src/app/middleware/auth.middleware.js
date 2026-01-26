import jwt from "jsonwebtoken";
import { envVars } from "../config/env.js";
import { ROLE_PERMISSIONS } from "../config/permissions.js";
import { Role } from "../utils/role.js";

export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const jwtToken = token.replace(/^Bearer\s*/i, "");
        const decoded = jwt.verify(jwtToken, envVars.JWT_SECRET_TOKEN);

        // Attach standardized payload
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,     // e.g., SYSTEM_OWNER
            businessId: decoded.businessId || null,
            branchId: decoded.branchId || null,
            staffId: decoded.staffId || null
        };

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export const authorize = (permission) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        const allowedPermissions = ROLE_PERMISSIONS[userRole] || [];

        if (allowedPermissions.includes(permission) || userRole === Role.SYSTEM_OWNER) {
            // System Owner has catch-all access usually, but relying on explicit perm map is safer. 
            // However, prompt said "SYSTEM_OWNER: All permissions", and my map includes them.
            // Double check map coverage or use wildcard logic if preferred. 
            // My map has explicit permissions. I will stick to map.
            // Add explicit check for System Owner if map might be missing something future-proof
            if (!allowedPermissions.includes(permission) && userRole !== Role.SYSTEM_OWNER) {
                return res.status(403).json({ success: false, message: "Forbidden: Missing permission" });
            }
            // IF map calls out specific permissions, we trust the map.
            // If manual override for System Owner requested: "SYSTEM_OWNER: All permissions"
            // My map logic: `...Object.values(PERMISSIONS.PLATFORM.BUSINESS)` etc. covers it.
            // But to be safe and "ALL permissions":
            if (userRole === Role.SYSTEM_OWNER) return next();

            if (allowedPermissions.includes(permission)) {
                return next();
            }
        }

        return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    };
};

export const businessScope = (req, res, next) => {
    const { role, businessId } = req.user;

    // SYSTEM_OWNER: always allowed
    if (role === Role.SYSTEM_OWNER) return next();

    // BUSINESS_OWNER & STAFF: Must have businessId
    if (!businessId) {
        return res.status(403).json({ success: false, message: "Access denied: No business context" });
    }

    // Requests usually target a business info via params or body.
    // If route has :businessId info, verify it matches
    // But middleware mostly enforces "You can only act on YOUR business"
    // So if the controller uses `req.user.businessId` to filter data, we are good.
    // If the controller takes `req.params.businessId`, we should check it.

    if (req.params.businessId && req.params.businessId !== businessId) {
        return res.status(403).json({ success: false, message: "Access denied: Business mismatch" });
    }

    // For body check? Usually we trust controller to use req.user.businessId
    // But we can enforce it if body has it.
    if (req.body.businessId && req.body.businessId !== businessId) {
        return res.status(403).json({ success: false, message: "Access denied: Business mismatch in body" });
    }

    // 🔒 Security Fix: Check query parameters as well
    if (req.query.businessId && req.query.businessId !== businessId) {
        return res.status(403).json({ success: false, message: "Access denied: Business mismatch in query parameters" });
    }

    next();
};

export const branchScope = (req, res, next) => {
    const { role, businessId, branchId } = req.user;

    // SYSTEM_OWNER: always allowed
    if (role === Role.SYSTEM_OWNER) return next();

    // BUSINESS_OWNER: Allowed for any branch in their business
    if (role === Role.BUSINESS_OWNER) {
        // Validation: if params.branchId exists, we might want to check if it belongs to business?
        // That requires DB. Prompt says "BUSINESS_OWNER -> any branch in own business".
        // Without DB check here, we rely on controller or subsequent query ensuring branch belongs to business.
        // Or we rely on "scope" meaning "don't block".
        // Since Business Owner has NO verification limitation other than businessId, we pass.
        // BUT businessScope should have run before this.
        return next();
    }

    // STAFF: Only own branch
    if (!branchId) {
        return res.status(403).json({ success: false, message: "Access denied: No branch context" });
    }

    if (req.params.branchId && req.params.branchId !== branchId) {
        return res.status(403).json({ success: false, message: "Access denied: Branch mismatch" });
    }

    if (req.body.branchId && req.body.branchId !== branchId) {
        return res.status(403).json({ success: false, message: "Access denied: Branch mismatch in body" });
    }

    next();
};

export const resolveStaffFromToken = (req, res, next) => {
    // If Business Owner tries to add points, we mock staff context using their ID
    if (req.user.role === Role.BUSINESS_OWNER) {
        req.staff = {
            id: null, // No specific staff record for owner
            businessId: req.user.businessId,
            branchId: null, // Owner acts globally across branches
            isActive: true
        };
        return next();
    }

    if (req.user.role !== Role.STAFF) {
        return res.status(403).json({ success: false, message: "Access denied: Not a staff member" });
    }

    if (!req.user.staffId) {
        return res.status(403).json({ success: false, message: "Invalid staff context" });
    }

    req.staff = {
        id: req.user.staffId,
        businessId: req.user.businessId,
        branchId: req.user.branchId,
        isActive: true
    };
    next();
};
