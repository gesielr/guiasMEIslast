import cron from "node-cron";
import { pollPendingEmissions } from "./status-poller";
import { checkCertificatesExpiry } from "./../../nfse/services/certificate-monitor.service";

// Poll every 5 minutes
export function startScheduler() {
  cron.schedule("*/5 * * * *", async () => {
    try {
      await pollPendingEmissions();
    } catch (err) {
      console.error("Error polling emissions:", err);
    }
  });

  // Run certificate expiry checker once per day at 00:30
  cron.schedule("30 0 * * *", async () => {
    try {
      await checkCertificatesExpiry();
    } catch (err) {
      console.error("Error checking certificate expiry:", err);
    }
  });
}
