import { useEffect, useState } from "react";

function App() {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/timetable/batch/1", {
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2NzAxMjY1MiwiZXhwIjoxNzY3MDk5MDUyfQ.dBM9nXbAqck1hsI1YD0Ioxf7Cr9tP3h6sxnJGzWgfGY",
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
        console.log("API RESPONSE:", data);
        setTimetable(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Loading timetable...</h2>;

  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  if (!timetable || typeof timetable !== "object") {
    return <h2>No timetable available</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Batch 1 Timetable</h1>

      {Object.keys(timetable).map((day) => (
        <div key={day} style={{ marginBottom: "20px" }}>
          <h2>{day}</h2>

          {timetable[day].map((entry, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "8px",
              }}
            >
              <strong>{entry.time}</strong>
              <div>{entry.course}</div>
              <div>{entry.faculty}</div>
              <div>{entry.room}</div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                {entry.type}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;
