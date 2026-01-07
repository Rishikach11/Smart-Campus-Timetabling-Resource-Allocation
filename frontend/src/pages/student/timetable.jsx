import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

function StudentTimetable() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [timetable, setTimetable] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentTimetable = async () => {
      try {
        const meRes = await fetch("http://localhost:5000/api/me", { headers });
        const user = await meRes.json();

        if (user.role !== "STUDENT") {
          setMessage("Unauthorized access");
          setLoading(false);
          return;
        }

        if (!user.batch || !user.batch.id) {
          setMessage("No batch assigned to student");
          setLoading(false);
          return;
        }

        const batchId = user.batch.id;

        const ttRes = await fetch(
          `http://localhost:5000/api/timetable/batch/${batchId}`,
          { headers }
        );

        const data = await ttRes.json();

        if (data.generated) {
          setTimetable(data.timetable);
        } else {
          setMessage("Timetable not generated yet");
        }
      } catch (err) {
        setMessage("Failed to load timetable");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentTimetable();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <Navbar />
        <p>Loading timetable...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />
      <h1>My Timetable</h1>

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
                  <th>Faculty</th>
                  <th>Room</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s, i) => (
                  <tr key={i}>
                    <td>{s.time}</td>
                    <td>{s.course}</td>
                    <td>{s.faculty}</td>
                    <td>{s.room}</td>
                    <td>{s.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}

export default StudentTimetable;
