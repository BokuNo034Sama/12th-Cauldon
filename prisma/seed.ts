import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  RiskProfile,
  UserRole,
} from "../backend/src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the Prisma seed script.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const admin = await prisma.user.upsert({
    create: {
      email: "founder@12thcauldron.local",
      fullName: "12th Cauldron Founder",
      phone: "+2348000000000",
      role: UserRole.PLATFORM_ADMIN,
    },
    update: {},
    where: { email: "founder@12thcauldron.local" },
  });

  await prisma.group.upsert({
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      createdById: admin.id,
      currency: "NGN",
      cycleDurationMonths: 12,
      description: "Seed group for validating collaborative savings workflows.",
      monthlyContribution: "50000.00",
      name: "Founders Circle",
      riskProfile: RiskProfile.BALANCED,
    },
    update: {},
    where: { id: "00000000-0000-0000-0000-000000000001" },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
