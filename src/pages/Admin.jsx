export default function Admin() {

  const runDraw = () => {
    const winner = Math.floor(Math.random() * 100);
    alert("Winner number: " + winner);
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <button onClick={runDraw}>Run Draw</button>
    </div>
  );
}