import React, { useEffect, useState } from 'react';

export default function App() {
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/digest/workspace_test')
      .then(res => res.json())
      .then(data => setThemes(data.themes));
  }, []);

  return (
    <div>
      <h1>ReviewLoop Dashboard</h1>
      <ul>
        {themes.map(t => (
          <li key={t.name}>{t.name}: {t.count}</li>
        ))}
      </ul>
    </div>
  );
}
