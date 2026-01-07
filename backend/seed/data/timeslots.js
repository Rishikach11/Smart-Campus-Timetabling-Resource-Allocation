const days = ["MON", "TUE", "WED", "THU", "FRI"];

const slots = [
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "10:00", endTime: "11:00" },
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "15:00", endTime: "16:00" },
];

module.exports = days.flatMap((day) =>
  slots.map((slot) => ({
    day,
    startTime: slot.startTime,
    endTime: slot.endTime,
  }))
);
