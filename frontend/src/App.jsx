import { useEffect, useState } from "react";

function App() {
  const [statusMessage, setStatusMessage] = useState("");
  const [batchId, setBatchId] = useState(1);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2NzAxMjY1MiwiZXhwIjoxNzY3MDk5MDUyfQ.dBM9nXbAqck1hsI1YD0Ioxf7Cr9tP3h6sxnJGzWgfGY";

  const fetchTimetable = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/timetable/batch/${batchId}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.message);
          });
        }
        return res.json();
      })
      .then((data) => {
        setTimetable(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTimetable();
  }, [batchId]);

  const handleGenerate = async () => {
  try {
    setLoading(true);
    setStatusMessage("Generating timetable...");

    const res = await fetch(
      `http://localhost:5000/api/generate/batch/${batchId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }

    setStatusMessage("Timetable generated successfully ✅");
    fetchTimetable();
  } catch (err) {
    setStatusMessage(`Error: ${err.message}`);
    setLoading(false);
  }
};

{statusMessage && (
  <div
    style={{
      marginBottom: "15px",
      color: statusMessage.startsWith("Error") ? "red" : "green",
    }}
  >
    {statusMessage}
  </div>
)}



  if (loading) return <h2>Loading timetable...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;
  if (!timetable || typeof timetable !== "object")
    return <h2>No timetable available</h2>;

  const days = ["MON", "TUE", "WED", "THU", "FRI"];

  const timeSlots = Array.from(
    new Set(
      Object.values(timetable)
        .flat()
        .map((entry) => entry.time)
    )
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>Batch {batchId} Timetable</h1>

      {/* Generate Button */}
      <button onClick={handleGenerate} style={{ marginBottom: "15px" }}>
        Generate Timetable
      </button>

      {/* Batch Selector */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Select Batch:&nbsp;
          <select
            value={batchId}
            onChange={(e) => setBatchId(Number(e.target.value))}
          >
            <option value={1}>Batch 1</option>
            <option value={2}>Batch 2</option>
            <option value={3}>Batch 3</option>
          </select>
        </label>
      </div>

      {/* Timetable Grid */}
      <table
        border="1"
        cellPadding="10"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>Time</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {timeSlots.map((time) => (
            <tr key={time}>
              <td>
                <strong>{time}</strong>
              </td>

              {days.map((day) => {
                const entry = timetable[day]?.find(
                  (e) => e.time === time
                );

                return (
                  <td key={day}>
                    {entry ? (
                      <>
                        <div>{entry.course}</div>
                        <div style={{ fontSize: "12px" }}>
                          {entry.faculty}
                        </div>
                        <div style={{ fontSize: "12px" }}>
                          {entry.room}
                        </div>
                        <div style={{ fontSize: "11px", opacity: 0.7 }}>
                          {entry.type}
                        </div>
                      </>
                    ) : (
                      <span style={{ opacity: 0.3 }}>—</span>
                    )}
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

export default App;
