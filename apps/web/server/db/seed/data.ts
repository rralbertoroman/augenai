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

export const diseases: (typeof DiseasesTable.$inferInsert)[] = [
  {
    createdAt: new Date("2025-11-22 14:01:54.270277-05"),
    updatedAt: new Date("2025-11-22 14:01:54.270277-05"),
    id: "635cd7a3-4df6-44e4-9ca2-7320e99f821c",
    name: "Glaucoma",
    stages: ["Normal G0", "Temprano G1", "Moderado G2", "Avanzado G3"],
  },
  {
    createdAt: new Date("2025-12-03 13:34:09.996729-05"),
    updatedAt: new Date("2025-12-03 13:34:09.996729-05"),
    id: "735a8aaa-f1e4-4152-9c44-e12eb7d85086",
    name: "Unknown disease",
    stages: ["Unknown Stage U0"],
  },
  {
    createdAt: new Date("2025-11-22 14:00:42.070353-05"),
    updatedAt: new Date("2025-11-22 14:00:42.070353-05"),
    id: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
    name: "Retinopatía Diabética",
    stages: [
      "Normal R0",
      "Leve R1",
      "Moderada R2",
      "Severa R3",
      "Proliferativa R4",
    ],
  },
  {
    createdAt: new Date("2026-06-28 12:00:00.000000-05"),
    updatedAt: new Date("2026-06-28 12:00:00.000000-05"),
    id: "a111aaaa-1111-4111-8111-111111111111",
    name: "AMD",
    stages: ["AMD"],
  },
];

export const models: (typeof ModelsTable.$inferInsert)[] = [
  {
    createdAt: new Date("2025-11-22 14:27:44.608572-05"),
    updatedAt: new Date("2025-11-22 14:27:44.608572-05"),
    id: "176490aa-2992-4dfc-b568-966bbb9cde40",
    modelName: "diabetic-retinopathy-224-procnorm-vit",
    modelTasks: ["classification"],
    diseases: ["e7624fe6-8496-4d7d-b7fb-132a8ee91083"],
    acceptedImageTypes: ["fundus"],
    latestTraining: new Date("2025-11-09 02:09:32-05"),
    accuracy: 0.74,
    size: 343278000,
    params: 85802500,
  },
  {
    createdAt: new Date("2025-12-03 12:49:57.29399-05"),
    updatedAt: new Date("2025-12-03 12:49:57.29399-05"),
    id: "4d73390f-2c9c-4c3e-8f29-094cca1f4af2",
    modelName: "Diabetic_RetinoPathy_detection",
    modelTasks: ["classification"],
    diseases: ["e7624fe6-8496-4d7d-b7fb-132a8ee91083"],
    acceptedImageTypes: ["fundus"],
    latestTraining: new Date("2025-11-25 07:15:02.464-05"),
    accuracy: 0.78,
    size: 346378000,
    params: 86588200,
  },
  {
    createdAt: new Date("2025-11-22 14:27:44.608572-05"),
    updatedAt: new Date("2025-11-22 14:27:44.608572-05"),
    id: "acd5215d-1a94-40c0-983e-5e54e06d4cde",
    modelName: "swinv2_tiny_for_glaucoma_classification",
    modelTasks: ["classification"],
    diseases: ["635cd7a3-4df6-44e4-9ca2-7320e99f821c"],
    acceptedImageTypes: ["fundus"],
    latestTraining: new Date("2025-11-22 10:45:09-05"),
    accuracy: 0.71,
    size: 110405000,
    params: 27579700,
  },
  {
    createdAt: new Date("2025-11-27 16:03:06-05"),
    updatedAt: new Date("2025-11-27 16:03:08-05"),
    id: "bb24ed4a-912d-42e8-964b-7c0857002fb1",
    modelName: "yolo11m_dr_lesion",
    modelTasks: ["detection"],
    diseases: ["e7624fe6-8496-4d7d-b7fb-132a8ee91083"],
    acceptedImageTypes: ["fundus"],
    latestTraining: new Date("2025-11-24 04:00:00-05"),
    accuracy: 0.5,
    size: 39000000,
    params: 27000000,
  },
  {
    createdAt: new Date("2026-06-28 12:00:00-05"),
    updatedAt: new Date("2026-06-28 12:00:00-05"),
    id: "b222bbbb-2222-4222-8222-222222222222",
    modelName: "resnet34_unet",
    modelTasks: ["segmentation"],
    diseases: ["a111aaaa-1111-4111-8111-111111111111"],
    acceptedImageTypes: ["OCT"],
    latestTraining: new Date("2026-06-20 04:00:00-05"),
    accuracy: 0.8,
    size: 296323151,
    params: 46000000,
  },
];

export const lesions: (typeof LesionsTable.$inferInsert)[] = [
  {
    createdAt: new Date("2025-11-28 00:25:26.610755-05"),
    updatedAt: new Date("2025-11-28 00:25:26.610755-05"),
    id: "611eaf71-2766-4cfe-9c26-716637a84717",
    name: "Soft Exudate",
    classId: 3,
  },
  {
    createdAt: new Date("2025-11-28 00:25:26.610755-05"),
    updatedAt: new Date("2025-11-28 00:25:26.610755-05"),
    id: "b760ec93-f60f-46fc-8772-e41ae7202c3e",
    name: "Hemorrhage",
    classId: 1,
  },
  {
    createdAt: new Date("2025-11-28 00:25:26.610755-05"),
    updatedAt: new Date("2025-11-28 00:25:26.610755-05"),
    id: "bc87be61-9c9f-4d81-968b-f111ea31a55f",
    name: "Exudate",
    classId: 2,
  },
  {
    createdAt: new Date("2025-11-28 00:25:26.610755-05"),
    updatedAt: new Date("2025-11-28 00:25:26.610755-05"),
    id: "c49f167e-48a2-45dc-8de7-d8de893614be",
    name: "Microaneurysm",
    classId: 0,
  },
  {
    createdAt: new Date("2025-12-03 13:54:33.893711-05"),
    updatedAt: new Date("2025-12-03 13:54:33.893711-05"),
    id: "db9bb69e-7438-4110-90b8-f97558e8a5a6",
    name: "Unknown lesion",
    classId: 127,
  },
];

export const lesionDiseaseLinks: (typeof LesionDiseaseLinkTable.$inferInsert)[] =
  [
    {
      createdAt: new Date("2025-11-28 00:31:25.040056-05"),
      updatedAt: new Date("2025-11-28 00:31:25.040056-05"),
      lesionId: "611eaf71-2766-4cfe-9c26-716637a84717",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
    },
    {
      createdAt: new Date("2025-11-28 00:31:25.040056-05"),
      updatedAt: new Date("2025-11-28 00:31:25.040056-05"),
      lesionId: "b760ec93-f60f-46fc-8772-e41ae7202c3e",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
    },
    {
      createdAt: new Date("2025-11-28 00:31:25.040056-05"),
      updatedAt: new Date("2025-11-28 00:31:25.040056-05"),
      lesionId: "bc87be61-9c9f-4d81-968b-f111ea31a55f",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
    },
    {
      createdAt: new Date("2025-11-28 00:31:25.040056-05"),
      updatedAt: new Date("2025-11-28 00:31:25.040056-05"),
      lesionId: "c49f167e-48a2-45dc-8de7-d8de893614be",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
    },
  ];

export const predictionClassDiseases: (typeof PredictionClassesTable.$inferInsert)[] =
  [
    {
      createdAt: new Date("2025-11-22 14:58:21.425211-05"),
      updatedAt: new Date("2025-11-22 14:58:21.425211-05"),
      modelId: "176490aa-2992-4dfc-b568-966bbb9cde40",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
      stageIdx: 1,
      classId: 0,
    },
    {
      createdAt: new Date("2025-11-22 14:58:21.425211-05"),
      updatedAt: new Date("2025-11-22 14:58:21.425211-05"),
      modelId: "176490aa-2992-4dfc-b568-966bbb9cde40",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
      stageIdx: 2,
      classId: 1,
    },
    {
      createdAt: new Date("2025-11-22 14:58:21.425211-05"),
      updatedAt: new Date("2025-11-22 14:58:21.425211-05"),
      modelId: "176490aa-2992-4dfc-b568-966bbb9cde40",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
      stageIdx: 0,
      classId: 2,
    },
    {
      createdAt: new Date("2025-11-22 14:58:21.425211-05"),
      updatedAt: new Date("2025-11-22 14:58:21.425211-05"),
      modelId: "176490aa-2992-4dfc-b568-966bbb9cde40",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
      stageIdx: 4,
      classId: 3,
    },
    {
      createdAt: new Date("2025-11-22 14:58:21.425211-05"),
      updatedAt: new Date("2025-11-22 14:58:21.425211-05"),
      modelId: "176490aa-2992-4dfc-b568-966bbb9cde40",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
      stageIdx: 3,
      classId: 4,
    },
    {
      createdAt: new Date("2025-12-03 13:52:04.876551-05"),
      updatedAt: new Date("2025-12-03 13:52:04.876551-05"),
      modelId: "176490aa-2992-4dfc-b568-966bbb9cde40",
      diseaseId: "735a8aaa-f1e4-4152-9c44-e12eb7d85086",
      stageIdx: 0,
      classId: 127,
    },
    {
      createdAt: new Date("2025-12-03 12:51:39.083761-05"),
      updatedAt: new Date("2025-12-03 12:51:39.083761-05"),
      modelId: "4d73390f-2c9c-4c3e-8f29-094cca1f4af2",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
      stageIdx: 0,
      classId: 0,
    },
    {
      createdAt: new Date("2025-12-03 12:51:39.083761-05"),
      updatedAt: new Date("2025-12-03 12:51:39.083761-05"),
      modelId: "4d73390f-2c9c-4c3e-8f29-094cca1f4af2",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
      stageIdx: 1,
      classId: 1,
    },
    {
      createdAt: new Date("2025-12-03 12:51:39.083761-05"),
      updatedAt: new Date("2025-12-03 12:51:39.083761-05"),
      modelId: "4d73390f-2c9c-4c3e-8f29-094cca1f4af2",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
      stageIdx: 2,
      classId: 2,
    },
    {
      createdAt: new Date("2025-12-03 12:51:39.083761-05"),
      updatedAt: new Date("2025-12-03 12:51:39.083761-05"),
      modelId: "4d73390f-2c9c-4c3e-8f29-094cca1f4af2",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
      stageIdx: 3,
      classId: 3,
    },
    {
      createdAt: new Date("2025-12-03 12:51:39.083761-05"),
      updatedAt: new Date("2025-12-03 12:51:39.083761-05"),
      modelId: "4d73390f-2c9c-4c3e-8f29-094cca1f4af2",
      diseaseId: "e7624fe6-8496-4d7d-b7fb-132a8ee91083",
      stageIdx: 4,
      classId: 4,
    },
    {
      createdAt: new Date("2025-12-03 13:52:04.876551-05"),
      updatedAt: new Date("2025-12-03 13:52:04.876551-05"),
      modelId: "4d73390f-2c9c-4c3e-8f29-094cca1f4af2",
      diseaseId: "735a8aaa-f1e4-4152-9c44-e12eb7d85086",
      stageIdx: 0,
      classId: 127,
    },
    {
      createdAt: new Date("2025-11-22 14:58:21.425211-05"),
      updatedAt: new Date("2025-11-22 14:58:21.425211-05"),
      modelId: "acd5215d-1a94-40c0-983e-5e54e06d4cde",
      diseaseId: "635cd7a3-4df6-44e4-9ca2-7320e99f821c",
      stageIdx: 0,
      classId: 0,
    },
    {
      createdAt: new Date("2025-11-22 14:58:21.425211-05"),
      updatedAt: new Date("2025-11-22 14:58:21.425211-05"),
      modelId: "acd5215d-1a94-40c0-983e-5e54e06d4cde",
      diseaseId: "635cd7a3-4df6-44e4-9ca2-7320e99f821c",
      stageIdx: 1,
      classId: 1,
    },
    {
      createdAt: new Date("2025-11-22 14:58:21.425211-05"),
      updatedAt: new Date("2025-11-22 14:58:21.425211-05"),
      modelId: "acd5215d-1a94-40c0-983e-5e54e06d4cde",
      diseaseId: "635cd7a3-4df6-44e4-9ca2-7320e99f821c",
      stageIdx: 2,
      classId: 2,
    },
    {
      createdAt: new Date("2025-11-22 14:58:21.425211-05"),
      updatedAt: new Date("2025-11-22 14:58:21.425211-05"),
      modelId: "acd5215d-1a94-40c0-983e-5e54e06d4cde",
      diseaseId: "635cd7a3-4df6-44e4-9ca2-7320e99f821c",
      stageIdx: 3,
      classId: 3,
    },
    {
      createdAt: new Date("2025-12-03 13:52:04.876551-05"),
      updatedAt: new Date("2025-12-03 13:52:04.876551-05"),
      modelId: "acd5215d-1a94-40c0-983e-5e54e06d4cde",
      diseaseId: "735a8aaa-f1e4-4152-9c44-e12eb7d85086",
      stageIdx: 0,
      classId: 127,
    },
  ];

export const predictionClassLesions: (typeof PredictionClassLesionsTable.$inferInsert)[] =
  [
    {
      createdAt: new Date("2025-11-28 00:34:22.803367-05"),
      updatedAt: new Date("2025-11-28 00:34:22.803367-05"),
      classId: 0,
      modelId: "bb24ed4a-912d-42e8-964b-7c0857002fb1",
      lesionId: "c49f167e-48a2-45dc-8de7-d8de893614be",
    },
    {
      createdAt: new Date("2025-11-28 00:34:22.803367-05"),
      updatedAt: new Date("2025-11-28 00:34:22.803367-05"),
      classId: 1,
      modelId: "bb24ed4a-912d-42e8-964b-7c0857002fb1",
      lesionId: "b760ec93-f60f-46fc-8772-e41ae7202c3e",
    },
    {
      createdAt: new Date("2025-11-28 00:34:22.803367-05"),
      updatedAt: new Date("2025-11-28 00:34:22.803367-05"),
      classId: 2,
      modelId: "bb24ed4a-912d-42e8-964b-7c0857002fb1",
      lesionId: "bc87be61-9c9f-4d81-968b-f111ea31a55f",
    },
    {
      createdAt: new Date("2025-11-28 00:34:22.803367-05"),
      updatedAt: new Date("2025-11-28 00:34:22.803367-05"),
      classId: 3,
      modelId: "bb24ed4a-912d-42e8-964b-7c0857002fb1",
      lesionId: "611eaf71-2766-4cfe-9c26-716637a84717",
    },
    {
      createdAt: new Date("2025-12-03 14:19:00.818833-05"),
      updatedAt: new Date("2025-12-03 14:19:00.818833-05"),
      classId: 127,
      modelId: "bb24ed4a-912d-42e8-964b-7c0857002fb1",
      lesionId: "db9bb69e-7438-4110-90b8-f97558e8a5a6",
    },
  ];

// TODO: replace with real AMD biomarker labels once amd-biomarker package is installed
export const biomarkers: (typeof BiomarkersTable.$inferInsert)[] = [
  {
    id: "c1110000-1111-4111-8111-000000000000",
    name: "Background",
    classId: 0,
  },
  {
    id: "c1110000-1111-4111-8111-000000000001",
    name: "class_1",
    classId: 1,
  },
  {
    id: "c1110000-1111-4111-8111-000000000002",
    name: "class_2",
    classId: 2,
  },
  {
    id: "c1110000-1111-4111-8111-000000000003",
    name: "class_3",
    classId: 3,
  },
  {
    id: "c1110000-1111-4111-8111-000000000004",
    name: "class_4",
    classId: 4,
  },
];

export const biomarkerDiseaseLinks: (typeof BiomarkerDiseaseLinkTable.$inferInsert)[] =
  [
    {
      biomarkerId: "c1110000-1111-4111-8111-000000000000",
      diseaseId: "a111aaaa-1111-4111-8111-111111111111",
    },
    {
      biomarkerId: "c1110000-1111-4111-8111-000000000001",
      diseaseId: "a111aaaa-1111-4111-8111-111111111111",
    },
    {
      biomarkerId: "c1110000-1111-4111-8111-000000000002",
      diseaseId: "a111aaaa-1111-4111-8111-111111111111",
    },
    {
      biomarkerId: "c1110000-1111-4111-8111-000000000003",
      diseaseId: "a111aaaa-1111-4111-8111-111111111111",
    },
    {
      biomarkerId: "c1110000-1111-4111-8111-000000000004",
      diseaseId: "a111aaaa-1111-4111-8111-111111111111",
    },
  ];

export const predictionClassBiomarkers: (typeof PredictionClassBiomarkersTable.$inferInsert)[] =
  [
    {
      classId: 0,
      modelId: "b222bbbb-2222-4222-8222-222222222222",
      biomarkerId: "c1110000-1111-4111-8111-000000000000",
    },
    {
      classId: 1,
      modelId: "b222bbbb-2222-4222-8222-222222222222",
      biomarkerId: "c1110000-1111-4111-8111-000000000001",
    },
    {
      classId: 2,
      modelId: "b222bbbb-2222-4222-8222-222222222222",
      biomarkerId: "c1110000-1111-4111-8111-000000000002",
    },
    {
      classId: 3,
      modelId: "b222bbbb-2222-4222-8222-222222222222",
      biomarkerId: "c1110000-1111-4111-8111-000000000003",
    },
    {
      classId: 4,
      modelId: "b222bbbb-2222-4222-8222-222222222222",
      biomarkerId: "c1110000-1111-4111-8111-000000000004",
    },
  ];
