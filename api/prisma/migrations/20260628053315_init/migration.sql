-- CreateEnum
CREATE TYPE "JourneyStatus" AS ENUM ('creating_route', 'choosing_scene_points', 'writing_prompts', 'generating_images', 'saving_gallery', 'completed', 'completed_with_errors', 'failed');

-- CreateEnum
CREATE TYPE "RouteMode" AS ENUM ('google_routes', 'approximate');

-- CreateEnum
CREATE TYPE "RouteStyle" AS ENUM ('cinematic', 'watercolor', 'manga', 'travel_poster', 'concept_art');

-- CreateEnum
CREATE TYPE "SceneLabel" AS ENUM ('departure', 'midway', 'arrival');

-- CreateEnum
CREATE TYPE "SceneImageStatus" AS ENUM ('pending', 'generating', 'completed', 'failed');

-- CreateTable
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "originLat" DECIMAL(10,7) NOT NULL,
    "originLng" DECIMAL(10,7) NOT NULL,
    "destinationLat" DECIMAL(10,7) NOT NULL,
    "destinationLng" DECIMAL(10,7) NOT NULL,
    "routeGeojson" JSONB,
    "routeMode" "RouteMode",
    "style" "RouteStyle" NOT NULL,
    "status" "JourneyStatus" NOT NULL DEFAULT 'creating_route',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "label" "SceneLabel" NOT NULL,
    "order" INTEGER NOT NULL,
    "lat" DECIMAL(10,7) NOT NULL,
    "lng" DECIMAL(10,7) NOT NULL,
    "placeLabel" TEXT,
    "activeImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneImage" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "storageKey" TEXT,
    "status" "SceneImageStatus" NOT NULL DEFAULT 'pending',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SceneImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Journey_sessionId_createdAt_idx" ON "Journey"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Scene_activeImageId_key" ON "Scene"("activeImageId");

-- CreateIndex
CREATE INDEX "Scene_journeyId_order_idx" ON "Scene"("journeyId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Scene_journeyId_label_key" ON "Scene"("journeyId", "label");

-- CreateIndex
CREATE INDEX "SceneImage_sceneId_createdAt_idx" ON "SceneImage"("sceneId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SceneImage_sceneId_version_key" ON "SceneImage"("sceneId", "version");

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_activeImageId_fkey" FOREIGN KEY ("activeImageId") REFERENCES "SceneImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneImage" ADD CONSTRAINT "SceneImage_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;
