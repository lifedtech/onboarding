const prisma = require('./src/lib/prisma');

async function main() {
  const user = await prisma.opsUser.findFirst();
  if (!user) {
    console.log("No ops user found! Create one first.");
    return;
  }

  const healthmates = [
    {
      name: "Inner Reset host",
      type: "PRACTITIONER",
      category: "Wellness",
      phase: "PRE_QUALIFY",
      daysInPhase: 5,
      contactName: "Rahul Sharma",
      contactEmail: "rahul@example.com",
      contactPhone: "9876543210",
      registrationStatus: "PENDING",
      opsUserId: user.id
    },
    {
      name: "Ojas Renewal centre",
      type: "CENTRE",
      category: "Digital-worker reset",
      phase: "PREPARE",
      daysInPhase: 12,
      contactName: "Sneha Patel",
      contactEmail: "sneha@example.com",
      contactPhone: "9876543211",
      registrationStatus: "PENDING",
      opsUserId: user.id
    },
    {
      name: "Women's program host",
      type: "ORGANIZER",
      category: "Women's reset",
      phase: "REGISTER",
      daysInPhase: 3,
      contactName: "Anjali Desai",
      contactEmail: "anjali@example.com",
      contactPhone: "9876543212",
      registrationStatus: "VERIFIED",
      opsUserId: user.id
    },
    {
      name: "Know Thyself",
      type: "PRACTITIONER",
      category: "Functional movement",
      phase: "REVIEW",
      daysInPhase: 7,
      contactName: "Vikram Singh",
      contactEmail: "vikram@example.com",
      contactPhone: "9876543213",
      registrationStatus: "VERIFIED",
      opsUserId: user.id
    },
    {
      name: "Forest Community",
      type: "CENTRE",
      category: "Nature / lifestyle",
      phase: "LIVE",
      daysInPhase: 30,
      contactName: "Priya Kumar",
      contactEmail: "priya@example.com",
      contactPhone: "9876543214",
      registrationStatus: "VERIFIED",
      opsUserId: user.id
    }
  ];

  for (const hm of healthmates) {
    await prisma.healthmate.create({ data: hm });
  }

  console.log("Seeded demo healthmates!");
}

main().catch(console.error).finally(() => process.exit(0));
