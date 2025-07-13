const { google } = require("googleapis");

exports.shutdownGeminiAPI = async (pubSubEvent, context) => {
  const data = JSON.parse(Buffer.from(pubSubEvent.data, "base64").toString());
  const costAmount = parseFloat(data.costAmount || 0);
  const budgetAmount = parseFloat(data.budgetAmount || 0);

  // Only act if cost >= budget
  if (costAmount < budgetAmount) {
    console.log("Budget not yet exceeded.");
    return;
  }

  const projectId = process.env.GCLOUD_PROJECT;
  const serviceName = "aiplatform.googleapis.com"; // Gemini API

  const serviceUsage = google.serviceusage("v1");
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  // Disable the Gemini API
  await serviceUsage.services.disable({
    name: `projects/${projectId}/services/${serviceName}`,
    auth,
  });

  console.log(
    `Disabled ${serviceName} for project ${projectId} due to budget limit.`
  );
};
