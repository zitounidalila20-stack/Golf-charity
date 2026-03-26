// import { useEffect, useState } from "react";
// // import { supabase } from "../services/supabaseClient";

// export default function Dashboard() {
//   const [scores, setScores] = useState([]);

//   useEffect(() => {
//     fetchScores();
//   }, []);

//   const fetchScores = async () => {
//     const { data } = await supabase.from("scores").select("*");
//     setScores(data);
//   };

//   return (
//     <div>
//       <h2>Dashboard</h2>
//       {scores.map((s) => (
//         <p key={s.id}>{s.score}</p>
//       ))}
//     </div>
//   );
// }


import { useState } from "react";

export default function Dashboard() {
  const [user] = useState({
    name: "Dalila",
    subscription: "Active",
    charity: "Red Cross",
  });

  const [scores, setScores] = useState([10, 20, 15]);

  const [newScore, setNewScore] = useState("");

  // ➕ Add score (keep only 5)
  const addScore = () => {
    if (!newScore) return;

    let updated = [parseInt(newScore), ...scores];

    if (updated.length > 5) {
      updated = updated.slice(0, 5);
    }

    setScores(updated);
    setNewScore("");
  };

  // 🎲 Draw system
  const runDraw = () => {
    const winner = Math.floor(Math.random() * 50);
    alert("Draw result: " + winner);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      {/* 👤 User Info */}
      <div>
        <h3>Welcome, {user.name}</h3>
        <p>Subscription: {user.subscription}</p>
        <p>Charity: {user.charity}</p>
      </div>

      <hr />

      {/* ⛳ Scores */}
      <div>
        <h3>Your Scores</h3>

        <input
          type="number"
          placeholder="Enter score"
          value={newScore}
          onChange={(e) => setNewScore(e.target.value)}
        />
        <button onClick={addScore}>Add Score</button>

        <ul>
          {scores.map((s, index) => (
            <li key={index}>{s}</li>
          ))}
        </ul>
      </div>

      <hr />

      {/* 🎲 Draw */}
      <div>
        <h3>Monthly Draw</h3>
        <button onClick={runDraw}>Run Draw</button>
      </div>
    </div>
  );
}