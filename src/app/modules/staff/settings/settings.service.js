import prisma from "../../../prisma/client.js";

export const getStaffSettings = async ({ staff }) => {
  const staffData = await prisma.staff.findUnique({
    where: { id: staff.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
      branch: {
        select: {
          name: true,
          city: true,
          country: true,
        },
      },
    },
  });

  if (!staffData) {
    throw new Error("Staff not found");
  }

  return {
    name: staffData.user.name,
    email: staffData.user.email,
    phone: staffData.user.phone,
    avatarUrl: staffData.user.avatarUrl,
    role: staffData.role,
    branch: staffData.branch,
  };
};
