import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

function FacultyTimetable() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [facultyId, setFacultyId] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [message, setMessage] = useState("");

  // 1️⃣ Fetch logged-in faculty ID
  useEffect(() => {
    const fetchFacultyId = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/me", { headers });
        const user = await res.json();

        if (user.faculty?.id) {
          setFacultyId(user.faculty.id);
        } else {
          setMessage("Faculty profile not found");
        }
      } catch {
        setMessage("Failed to identify faculty");
      }
    };

    fetchFacultyId();
  }, []);

  // 2️⃣ Fetch timetable AFTER facultyId is available
  useEffect(() => {
    if (!facultyId) return;

    const fetchTimetable = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/timetable/faculty/${facultyId}`,
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
  }, [facultyId]); // 🔥 THIS is the key fix

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
                </tr>
              </thead>
              <tbody>
                {slots.map((s, i) => (
                  <tr key={i}>
                    <td>{s.time}</td>
                    <td>{s.course}</td>
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

export default FacultyTimetable;
