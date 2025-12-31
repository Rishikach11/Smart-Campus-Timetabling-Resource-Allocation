import React from "react";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

function TimetableGrid({ entries, timeSlots }) {
  // Extract unique time ranges (e.g., "09:00 - 10:00")
  const uniqueTimeRanges = [...new Set(timeSlots.map(s => `${s.startTime} - ${s.endTime}`))].sort();

  const getEntry = (day, range) => {
    return entries.find(e => 
      e.timeSlot.day === day && 
      `${e.timeSlot.startTime} - ${e.timeSlot.endTime}` === range
    );
  };

  return (
    <div style={{ marginTop: "40px", overflowX: "auto" }}>
      <h3>Weekly Schedule</h3>
      <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa" }}>
            <th>Time / Day</th>
            {DAYS.map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {uniqueTimeRanges.map(range => (
            <tr key={range}>
              <td style={{ fontWeight: "bold", padding: "10px" }}>{range}</td>
              {DAYS.map(day => {
                const entry = getEntry(day, range);
                return (
                  <td key={`${day}-${range}`} style={{ padding: "10px", height: "80px", verticalAlign: "top" }}>
                    {entry ? (
                      <div style={{ fontSize: "0.8rem", backgroundColor: "#e3f2fd", padding: "5px", borderRadius: "4px" }}>
                        <strong>{entry.course.code}</strong><br/>
                        {entry.faculty.name}<br/>
                        <span style={{ color: "#666" }}>Room: {entry.room.name}</span>
                      </div>
                    ) : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TimetableGrid;