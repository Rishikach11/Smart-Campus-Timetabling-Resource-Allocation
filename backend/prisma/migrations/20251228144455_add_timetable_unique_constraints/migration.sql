/*
  Warnings:

  - A unique constraint covering the columns `[batchId,timeSlotId]` on the table `TimetableEntry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facultyId,timeSlotId]` on the table `TimetableEntry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roomId,timeSlotId]` on the table `TimetableEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TimetableEntry_batchId_timeSlotId_key" ON "TimetableEntry"("batchId", "timeSlotId");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableEntry_facultyId_timeSlotId_key" ON "TimetableEntry"("facultyId", "timeSlotId");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableEntry_roomId_timeSlotId_key" ON "TimetableEntry"("roomId", "timeSlotId");
