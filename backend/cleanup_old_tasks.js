const prisma = require('./src/lib/prisma');

const oldTasks = [
  "Verify primary contact email and phone number",
  "Complete screening call and business analysis",
  "Upload certified professional qualifications",
  "Sign partnership framework agreement",
  "Submit valid business registration registry copy",
  "Configure bank payout and tax collection variables",
  "Perform background verification and credit review",
  "Conduct live platform video walkthrough",
  "Configure booking schedule and live slots",
  "Send welcome package and micro-habits toolkit"
];

async function cleanup() {
  try {
    const result = await prisma.task.deleteMany({
      where: {
        title: {
          in: oldTasks
        }
      }
    });
    console.log(`Deleted ${result.count} old predefined tasks.`);
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
