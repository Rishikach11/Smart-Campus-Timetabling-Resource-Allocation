import { useEffect, useState } from "react";

function App() {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/timetable/batch/1", {
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2NjkwNDU3MiwiZXhwIjoxNzY2OTkwOTcyfQ.izusSPHbsXRCTEwShNUFiD-GYYH4IkOeL-8hQ6w-IOA",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("API RESPONSE:", data);
        setTimetable(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Loading timetable...</h2>;

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
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;
