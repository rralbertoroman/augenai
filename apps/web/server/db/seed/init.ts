import { sql } from "drizzle-orm";
import { db, queryClient } from "../client";
import {
  ModelsTable,
  DiseasesTable,
  LesionsTable,
  LesionDiseaseLinkTable,
  PredictionClassesTable,
  PredictionClassLesionsTable,
  BiomarkersTable,
  BiomarkerDiseaseLinkTable,
  PredictionClassBiomarkersTable,
} from "../schemas";
import {
  diseases,
  models,
  lesions,
  lesionDiseaseLinks,
  predictionClassDiseases,
  predictionClassLesions,
  biomarkers,
  biomarkerDiseaseLinks,
  predictionClassBiomarkers,
} from "./data";

// Drop tables in reverse order (to handle foreign key constraints)
// First drop tables that depend on predictions, then predictions themselves,
// then tables that depend on models/diseases/lesions/biomarkers, and finally the seed tables
const DROP_TABLES = [
  "classification_feedback",
  "detection_feedback",
  "classifications",
  "detections",
  "predictions",
  "prediction_requests",
  "prediction_sharing",
  "prediction_class_lesion",
  "prediction_class_disease",
  "prediction_class_biomarker",
  "lesion_disease_link",
  "biomarker_disease_link",
  "lesions",
  "biomarkers",
  "diseases",
  "models",
];

async function main() {
  try {
    console.log("Starting seed process...");

    // Truncate existing tables
    for (const table of DROP_TABLES) {
      try {
        console.log(`Truncating table: ${table}...`);
        await db.execute(sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`);
      } catch (error) {
        console.log(
          `Table ${table} might not exist or error truncating:`,
          error,
        );
      }
    }

    console.log("Waiting 5 seconds after truncate...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("Resuming after wait...");

    // Insert seed data in FK-safe order
    if (diseases.length) {
      console.log(`Seeding diseases (${diseases.length})...`);
      await db.insert(DiseasesTable).values(diseases);
    }
    if (models.length) {
      console.log(`Seeding models (${models.length})...`);
      await db.insert(ModelsTable).values(models);
    }
    if (lesions.length) {
      console.log(`Seeding lesions (${lesions.length})...`);
      await db.insert(LesionsTable).values(lesions);
    }
    if (biomarkers.length) {
      console.log(`Seeding biomarkers (${biomarkers.length})...`);
      await db.insert(BiomarkersTable).values(biomarkers);
    }
    if (lesionDiseaseLinks.length) {
      console.log(
        `Seeding lesion_disease_link (${lesionDiseaseLinks.length})...`,
      );
      await db.insert(LesionDiseaseLinkTable).values(lesionDiseaseLinks);
    }
    if (biomarkerDiseaseLinks.length) {
      console.log(
        `Seeding biomarker_disease_link (${biomarkerDiseaseLinks.length})...`,
      );
      await db.insert(BiomarkerDiseaseLinkTable).values(biomarkerDiseaseLinks);
    }
    if (predictionClassDiseases.length) {
      console.log(
        `Seeding prediction_class_disease (${predictionClassDiseases.length})...`,
      );
      await db.insert(PredictionClassesTable).values(predictionClassDiseases);
    }
    if (predictionClassLesions.length) {
      console.log(
        `Seeding prediction_class_lesion (${predictionClassLesions.length})...`,
      );
      await db
        .insert(PredictionClassLesionsTable)
        .values(predictionClassLesions);
    }
    if (predictionClassBiomarkers.length) {
      console.log(
        `Seeding prediction_class_biomarker (${predictionClassBiomarkers.length})...`,
      );
      await db
        .insert(PredictionClassBiomarkersTable)
        .values(predictionClassBiomarkers);
    }

    console.log("Seed process completed successfully.");
  } catch (error) {
    console.error("Seed Init Error:", error);
    process.exit(1);
  } finally {
    console.log("Closing database connection...");
    await queryClient.end();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

main();
