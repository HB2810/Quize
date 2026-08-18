import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanTestData() {
  console.log("🧹 Cleaning test data from database...");

  // Delete user test data in correct dependency order
  const deletedShares = await prisma.shareResult.deleteMany();
  console.log(`Deleted ${deletedShares.count} ShareResult rows`);

  const deletedRecognitions = await prisma.recognition.deleteMany();
  console.log(`Deleted ${deletedRecognitions.count} Recognition rows`);

  const deletedResponses = await prisma.response.deleteMany();
  console.log(`Deleted ${deletedResponses.count} Response rows`);

  const deletedConsents = await prisma.consent.deleteMany();
  console.log(`Deleted ${deletedConsents.count} Consent rows`);

  const deletedAnalytics = await prisma.analyticsEvent.deleteMany();
  console.log(`Deleted ${deletedAnalytics.count} AnalyticsEvent rows`);

  const deletedSessions = await prisma.session.deleteMany();
  console.log(`Deleted ${deletedSessions.count} Session rows`);

  const deletedParticipants = await prisma.participant.deleteMany();
  console.log(`Deleted ${deletedParticipants.count} Participant rows`);

  console.log("✨ Test data cleanup complete. Journey definitions remain intact!");
}

cleanTestData()
  .catch((e) => {
    console.error("Failed to clean test data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
