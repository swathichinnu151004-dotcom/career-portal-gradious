const db = require("../config/connectDB");
const logger = require("./logger");

/**
 * Ensures `jobs.openings` exists for openings-aware recruiter/user flows.
 * This keeps local/dev environments working even if SQL migrations were skipped.
 */
async function ensureJobsOpeningsColumn() {
  try {
    await db.query(
      "ALTER TABLE jobs ADD COLUMN openings INT NOT NULL DEFAULT 1 AFTER experience"
    );
    logger.info("Schema update: added jobs.openings column");
  } catch (error) {
    if (error?.code === "ER_DUP_FIELDNAME") {
      logger.info("Schema check: jobs.openings column already exists");
      return;
    }
    logger.error("Failed to ensure jobs.openings column:", error);
    throw error;
  }
}

module.exports = { ensureJobsOpeningsColumn };
