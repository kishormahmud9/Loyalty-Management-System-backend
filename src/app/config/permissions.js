export const PERMISSIONS = {
    PLATFORM: {
        BUSINESS: {
            CREATE: "platform.business.create",
            READ: "platform.business.read",
            SUSPEND: "platform.business.suspend",
        },
    },
    BUSINESS: {
        READ: "business.read",
        UPDATE: "business.update",
    },
    BRANCH: {
        CREATE: "branch.create",
        READ: "branch.read",
        UPDATE: "branch.update",
        DELETE: "branch.delete",
    },
    STAFF: {
        CREATE: "staff.create",
        READ: "staff.read",
        UPDATE: "staff.update",
        DELETE: "staff.delete",
    },
    REWARD: {
        EARN: {
            CREATE: "reward.earn.create",
        },
        REDEEM: {
            DIRECT: "reward.redeem.direct",
            REQUEST: "reward.redeem.request",
        },
    },
    CARD: {
        CREATE: "card.create",
        READ: "card.read",
        UPDATE: "card.update",
        DELETE: "card.delete",
    },
};

export const ROLE_PERMISSIONS = {
    SYSTEM_OWNER: [
        ...Object.values(PERMISSIONS.PLATFORM.BUSINESS),
        ...Object.values(PERMISSIONS.BUSINESS),
        ...Object.values(PERMISSIONS.BRANCH),
        ...Object.values(PERMISSIONS.STAFF),
        ...Object.values(PERMISSIONS.CARD),
        ...Object.values(PERMISSIONS.REWARD.EARN),
        ...Object.values(PERMISSIONS.REDEEM || {}), // Safety, though specific values are below
        PERMISSIONS.REWARD.REDEEM.DIRECT,
        PERMISSIONS.REWARD.REDEEM.REQUEST,
    ],
    BUSINESS_OWNER: [
        ...Object.values(PERMISSIONS.BUSINESS),
        ...Object.values(PERMISSIONS.BRANCH),
        ...Object.values(PERMISSIONS.STAFF),
        ...Object.values(PERMISSIONS.CARD),
        PERMISSIONS.REWARD.EARN.CREATE,
        PERMISSIONS.REWARD.REDEEM.DIRECT,
    ],
    STAFF: [
        PERMISSIONS.STAFF.READ,
        PERMISSIONS.CARD.READ,
        PERMISSIONS.REWARD.REDEEM.REQUEST,
    ],
};
