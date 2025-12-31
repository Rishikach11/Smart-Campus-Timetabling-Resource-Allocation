import { useEffect, useState } from "react";
import TimetableGrid from "../../components/TimetableGrid";

function StudentTimetable() {
  const [timetable, setTimetable] = useState({});
  const [allTimeSlots, setAllTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real app, 'batchId' would come from the decoded JWT token
  const batchId = 1; 
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Master Slots
        const slotsRes = await fetch("http://localhost:5000/api/timeslots", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const slotsData = await slotsRes.json();
        const uniqueTimes = [...new Set(slotsData.map(s => `${s.startTime}-${s.endTime}`))];
        setAllTimeSlots(uniqueTimes);

        // Fetch Student's Batch Timetable
        const tableRes = await fetch(`http://localhost:5000/api/timetable/batch/${batchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tableData = await tableRes.json();
        setTimetable(tableData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load student timetable", err);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <h2>Loading your schedule...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Timetable (Batch {batchId})</h1>
      <TimetableGrid timetable={timetable} allTimeSlots={allTimeSlots} />
    </div>
  );
}

export default StudentTimetable;