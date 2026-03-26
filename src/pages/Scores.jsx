// import { useState } from "react";
// import { supabase } from "../services/supabaseClient";

// export default function Scores() {
//   const [score, setScore] = useState("");

//   const addScore = async () => {
//     await supabase.from("scores").insert([{ score }]);
//   };

//   return (
//     <div>
//       <h2>Add Score</h2>
//       <input onChange={(e)=>setScore(e.target.value)} />
//       <button onClick={addScore}>Add</button>
//     </div>
//   );
// }
import { useState } from "react";

export default function Scores() {
  const [scores, setScores] = useState([
    { value: 12, date: "2026-03-20" },
    { value: 18, date: "2026-03-21" },
  ]);

  const [value, setValue] = useState("");
  const [date, setDate] = useState("");

  // ➕ Add Score
  const addScore = () => {
    if (!value || !date) return;

    let newScores = [
      { value: parseInt(value), date },
      ...scores,
    ];

    // keep only last 5
    if (newScores.length > 5) {
      newScores = newScores.slice(0, 5);
    }

    setScores(newScores);
    setValue("");
    setDate("");
  };

  // ❌ Delete Score
  const deleteScore = (index) => {
    const updated = scores.filter((_, i) => i !== index);
    setScores(updated);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Scores</h1>

      {/* ➕ Add Score */}
      <div>
        <input
          type="number"
          placeholder="Score (1-45)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={addScore}>Add</button>
      </div>

      <hr />

      {/* 📊 Scores List */}
      <ul>
        {scores.map((s, index) => (
          <li key={index}>
            Score: {s.value} | Date: {s.date}
            <button onClick={() => deleteScore(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}