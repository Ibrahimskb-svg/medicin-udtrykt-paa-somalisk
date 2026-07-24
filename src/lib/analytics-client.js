import { BetaAnalyticsDataClient } from "@google-analytics/data";

let client = null;

function getClient() {
  if (!client) {
    const raw = Buffer.from(process.env.GA_CREDENTIALS_B64 || "", "base64").toString("utf8");
    const parsed = JSON.parse(raw);
    client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: parsed.client_email,
        private_key: parsed.private_key,
      },
    });
  }
  return client;
}

export function getProperty() {
  return `properties/${process.env.GA_PROPERTY_ID}`;
}

export function getAnalyticsClient() {
  return getClient();
}
