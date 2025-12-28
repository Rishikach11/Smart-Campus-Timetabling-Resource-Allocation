-- CreateTable
CREATE TABLE "FacultyAvailability" (
    "id" SERIAL NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "timeSlotId" INTEGER NOT NULL,

    CONSTRAINT "FacultyAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacultyAvailability_facultyId_timeSlotId_key" ON "FacultyAvailability"("facultyId", "timeSlotId");

-- AddForeignKey
ALTER TABLE "FacultyAvailability" ADD CONSTRAINT "FacultyAvailability_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyAvailability" ADD CONSTRAINT "FacultyAvailability_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
