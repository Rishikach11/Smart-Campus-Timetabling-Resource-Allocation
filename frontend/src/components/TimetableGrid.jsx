function TimetableGrid({ timetable, allTimeSlots }) {
  const days = ["MON", "TUE", "WED", "THU", "FRI"];

  return (
    <table border="1" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Time</th>
          {days.map(day => <th key={day}>{day}</th>)}
        </tr>
      </thead>
      <tbody>
        {allTimeSlots.map(timeRange => (
          <tr key={timeRange}>
            <td><strong>{timeRange}</strong></td>
            {days.map(day => {
              const entry = timetable[day]?.find(e => e.time === timeRange);
              return (
                <td key={day} style={{ height: "60px", textAlign: "center" }}>
                  {entry ? (
                    <div>
                      <strong>{entry.course}</strong><br/>
                      <small>{entry.faculty} | {entry.room}</small><br/>
                      <span style={{ fontSize: '10px' }}>{entry.type}</span>
                    </div>
                  ) : "—"}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TimetableGrid;