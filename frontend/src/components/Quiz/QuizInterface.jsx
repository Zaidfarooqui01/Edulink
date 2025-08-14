import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const QuizInterface = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quizzes/active')
      .then(res => {
        setQuizzes(res.data.quizzes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading quizzes...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Active Quizzes</h2>
      {quizzes.length === 0 && <p>No quizzes available right now.</p>}
      <ul>
        {quizzes.map(q => (
          <li key={q._id}>
            <strong>{q.title}</strong> - {q.category} ({q.difficulty})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizInterface;
