import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

function FacultyTimetable() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [timetable, setTimetable] = useState(null);
  const [message, setMessage] = useState("Loading timetable...");

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/timetable/faculty",
          { headers }
        );

        const data = await res.json();

        if (data.generated) {
          setTimetable(data.timetable);
          setMessage("");
        } else {
          setTimetable(null);
          setMessage("No timetable assigned yet");
        }
      } catch {
        setMessage("Failed to load timetable");
      }
    };

    fetchTimetable();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />
      <h1>My Teaching Schedule</h1>

      {message && <p>{message}</p>}

      {timetable &&
        Object.entries(timetable).map(([day, slots]) => (
          <div key={day} style={{ marginBottom: "20px" }}>
            <h3>{day}</h3>
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Course</th>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Batch</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s, i) => (
                  <tr key={i}>
                    <td>{s.time}</td>
                    <td>{s.course}</td>
                    <td>{s.room}</td>
                    <td>{s.type}</td>
                    <td>{s.batch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}

export default FacultyTimetable;
