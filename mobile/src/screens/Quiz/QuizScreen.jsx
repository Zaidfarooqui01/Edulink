import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import api from '../../utils/api';

const QuizScreen = () => {
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

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Quizzes</Text>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.quizCard}>
            <Text style={styles.quizTitle}>{item.title}</Text>
            <Text>{item.category} - {item.difficulty}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  quizCard: { padding: 12, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
  quizTitle: { fontSize: 16, fontWeight: 'bold' }
});

export default QuizScreen;
