import bcrypt from "bcrypt";

/* =========================
   TENANT LIST (TABLE PAGE)
========================= */
export const getTenantListService = async (prisma, query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {};
  if (query.status === "active") where.isActive = true;
  if (query.status === "inactive") where.isActive = false;

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { email: true },
        },
        _count: {
          select: {
            branches: {
              // ✅ FIXED
              where: { isActive: true },
            },
          },
        },
      },
    }),
    prisma.business.count({ where }),
  ]);

  const now = new Date();

  return {
    data: businesses.map((b) => {
      let subscription = "No Plan";

      if (b.trialEndsAt && b.trialEndsAt > now) {
        subscription = "Trial";
      }

      return {
        id: b.id,
        businessName: b.name,
        email: b.owner.email,
        createdOn: b.createdAt,
        subscription,
        location: `${b._count.branches} Location`, // ✅ FIXED
        status: b.isActive ? "Active" : "Inactive",
      };
    }),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* =========================
   CREATE TENANT
========================= */
export const createTenantService = async (prisma, payload) => {
  const { owner, business, branch } = payload;

  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Check owner email
    const existingUser = await tx.user.findUnique({
      where: { email: owner.email },
    });

    if (existingUser) {
      throw new Error("Owner email already exists");
    }

    // 2️⃣ Create Business Owner
    const hashedPassword = await bcrypt.hash(owner.password, 10);

    const createdOwner = await tx.user.create({
      data: {
        name: owner.name,
        email: owner.email,
        passwordHash: hashedPassword,
        phone: owner.phone,
        address: owner.address,
        role: "BUSINESS_OWNER",
        isVerified: false,
      },
    });

    // 3️⃣ Create Business (Tenant)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const createdBusiness = await tx.business.create({
      data: {
        name: business.name,
        industry: business.industry,
        country: business.country,
        ownerId: createdOwner.id,
        trialEndsAt,
        qrCode: `QR-${Date.now()}`, // temp
      },
    });

    // 4️⃣ Create Default Branch
    const createdBranch = await tx.branch.create({
      data: {
        businessId: createdBusiness.id,
        businessName: createdBusiness.name,
        managerName: createdOwner.name,
        name: "Main Branch",
        address: branch.address,
        country: business.country,
      },
    });

    return {
      owner: createdOwner,
      business: createdBusiness,
      branch: createdBranch,
    };
  });
};

/* =========================
   TENANT DETAILS (VIEW)
========================= */
export const getTenantDetailsService = async (prisma, tenantId) => {
  if (!tenantId) {
    const error = new Error("Tenant ID is required");
    error.statusCode = 400;
    throw error;
  }

  const business = await prisma.business.findUnique({
    where: { id: tenantId },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      branches: {
        // ✅ FIXED
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          country: true,
          isActive: true,
        },
      },
    },
  });

  if (!business) {
    const error = new Error("Tenant not found");
    error.statusCode = 404;
    throw error;
  }

  // Trial / Plan logic (temporary)
  const now = new Date();
  let planType = "No Plan";
  let billingStatus = "Inactive";

  if (business.trialEndsAt && business.trialEndsAt > now) {
    planType = "Trial";
    billingStatus = "Trial";
  }

  return {
    owner: {
      name: business.owner.name,
      email: business.owner.email,
      phone: business.owner.phone,
      address: business.owner.address,
    },
    business: {
      id: business.id,
      name: business.name,
      industry: business.industry,
      registrationDate: business.createdAt,
      isActive: business.isActive,
      trialEndsAt: business.trialEndsAt,
    },
    branches: business.branches, // ✅ FIXED
    stats: {
      totalBranches: business.branches.length, // ✅ FIXED
      planType,
      billingStatus,
    },
  };
};

/* =========================
   UPDATE TENANT
========================= */
export const updateTenantService = async (prisma, tenantId, payload) => {
  if (!tenantId) {
    const err = new Error("Tenant ID is required");
    err.statusCode = 400;
    throw err;
  }

  const { owner = {}, business = {} } = payload;

  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Find business (and owner)
    const existingBusiness = await tx.business.findUnique({
      where: { id: tenantId },
      include: {
        owner: true,
      },
    });

    if (!existingBusiness) {
      const err = new Error("Tenant not found");
      err.statusCode = 404;
      throw err;
    }

    // 2️⃣ Update owner (if any field provided)
    if (Object.keys(owner).length > 0) {
      // ❗ Prevent email conflict (if email is updated)
      if (owner.email && owner.email !== existingBusiness.owner.email) {
        const emailExists = await tx.user.findUnique({
          where: { email: owner.email },
        });

        if (emailExists) {
          const err = new Error("Email already in use");
          err.statusCode = 400;
          throw err;
        }
      }

      await tx.user.update({
        where: { id: existingBusiness.ownerId },
        data: owner,
      });
    }

    // 3️⃣ Update business (if any field provided)
    if (Object.keys(business).length > 0) {
      await tx.business.update({
        where: { id: tenantId },
        data: business,
      });
    }

    return true;
  });
};

/* =========================
   DELETE TENANT
========================= */
export const deleteTenantService = async (prisma, tenantId) => {
  if (!tenantId) {
    const err = new Error("Tenant ID is required");
    err.statusCode = 400;
    throw err;
  }

  // Check tenant exists
  const business = await prisma.business.findUnique({
    where: { id: tenantId },
  });

  if (!business) {
    const err = new Error("Tenant not found");
    err.statusCode = 404;
    throw err;
  }

  // HARD DELETE BUSINESS
  // Branches will be deleted automatically (CASCADE)
  await prisma.business.delete({
    where: { id: tenantId },
  });

  return true;
};

/* =========================
   DISABLE TENANT BRANCHES
========================= */
export const updateBranchStatusService = async (
  prisma,
  tenantId,
  action,
  count,
) => {
  if (!tenantId || !action || !count || count <= 0) {
    const err = new Error("tenantId, action and valid count are required");
    err.statusCode = 400;
    throw err;
  }

  if (!["enable", "disable"].includes(action)) {
    const err = new Error("Action must be 'enable' or 'disable'");
    err.statusCode = 400;
    throw err;
  }

  const targetStatus = action === "disable" ? true : false;

  const result = await prisma.$transaction(async (tx) => {
    const branches = await tx.branch.findMany({
      where: {
        businessId: tenantId,
        isActive: targetStatus,
      },
      orderBy: { createdAt: "asc" },
    });

    return { branches };
  });

  const branches = result.branches;

  if (branches.length === 0) {
    const err = new Error(`No branches available to ${action}`);
    err.statusCode = 400;
    throw err;
  }

  if (count > branches.length) {
    const err = new Error(
      `Only ${branches.length} branch(es) available to ${action}`,
    );
    err.statusCode = 400;
    throw err;
  }

  // optional rule
  if (action === "disable" && count === branches.length) {
    const err = new Error("At least one active branch is required");
    err.statusCode = 400;
    throw err;
  }

  const branchIds = branches.slice(0, count).map((b) => b.id);

  await prisma.branch.updateMany({
    where: { id: { in: branchIds } },
    data: { isActive: action === "enable" },
  });

  return {
    action,
    affected: branchIds.length,
  };
};