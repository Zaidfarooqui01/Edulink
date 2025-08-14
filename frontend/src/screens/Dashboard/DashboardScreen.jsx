// src/screens/Dashboard/DashboardScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Avatar,
  Surface
} from 'react-native-paper';

import { fetchDashboardData } from '../../redux/slices/dashboardSlice';
import QuickStats from '../../components/Dashboard/QuickStats';
import UpcomingEvents from '../../components/Dashboard/UpcomingEvents';
import ActiveQuizzes from '../../components/Dashboard/ActiveQuizzes';
import NotificationBell from '../../components/Common/NotificationBell';

const DashboardScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { 
    stats, 
    upcomingEvents, 
    activeQuizzes, 
    loading 
  } = useSelector(state => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchDashboardData());
    setRefreshing(false);
  }, [dispatch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Surface style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Avatar.Image
                size={50}
                source={{ uri: user?.profile?.avatar }}
                style={styles.avatar}
              />
              <View style={styles.greetingContainer}>
                <Title style={styles.greeting}>
                  {getGreeting()}, {user?.profile?.firstName}!
                </Title>
                <Paragraph style={styles.subGreeting}>
                  Ready to learn something new today?
                </Paragraph>
              </View>
            </View>
            <NotificationBell />
          </View>
        </Surface>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Quick Stats</Title>
          <QuickStats stats={stats} />
        </View>

        {/* Active Quizzes */}
        {activeQuizzes?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Active Quizzes</Title>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Quiz')}
              >
                View All
              </Button>
            </View>
            <ActiveQuizzes 
              quizzes={activeQuizzes} 
              onQuizPress={(quiz) => navigation.navigate('Quiz', { quizId: quiz._id })}
            />
          </View>
        )}

        {/* Upcoming Events */}
        {upcomingEvents?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Upcoming Events</Title>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Events')}
              >
                View All
              </Button>
            </View>
            <UpcomingEvents 
              events={upcomingEvents}
              onEventPress={(event) => navigation.navigate('EventDetail', { eventId: event._id })}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.quickActions}>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('Quiz')}>
              <Card.Content style={styles.actionContent}>
                <Title style={styles.actionTitle}>Take Quiz</Title>
                <Paragraph>Test your knowledge</Paragraph>
              </Card.Content>
            </Card>
            
            <Card style={styles.actionCard} onPress={() => navigation.navigate('Events')}>
              <Card.Content style={styles.actionContent}>
                <Title style={styles.actionTitle}>Browse Events</Title>
                <Paragraph>Find opportunities</Paragraph>
              </Card.Content>
            </Card>
            
            <Card style={styles.actionCard} onPress={() => navigation.navigate('Chat')}>
              <Card.Content style={styles.actionContent}>
                <Title style={styles.actionTitle}>Connect</Title>
                <Paragraph>Chat with peers</Paragraph>
              </Card.Content>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    elevation: 4,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatar: {
    marginRight: 12
  },
  greetingContainer: {
    flex: 1
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },
  subGreeting: {
    fontSize: 14,
    color: '#666'
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  actionCard: {
    width: '30%',
    marginBottom: 12
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 16
  },
  actionTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4
  }
});

export default DashboardScreen;
