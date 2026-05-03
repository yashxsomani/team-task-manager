import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return null;

  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>

      <div className={styles.stats}>
        <div className={styles.card}>
          <h3>Total Tasks</h3>
          <p className={styles.number}>{data.totalTasks}</p>
        </div>
        <div className={styles.card}>
          <h3>Completed Tasks</h3>
          <p className={styles.number}>{data.completedTasks}</p>
        </div>
        <div className={styles.card}>
          <h3>Overdue Tasks</h3>
          <p className={styles.number}>{data.overdueTasks.length}</p>
        </div>
      </div>

      <div className={styles.tasksByStatus}>
        <h2>Tasks by Status</h2>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span>To Do</span>
            <span className={styles.count}>{data.tasksByStatus.TODO}</span>
          </div>
          <div className={styles.statusItem}>
            <span>In Progress</span>
            <span className={styles.count}>{data.tasksByStatus.IN_PROGRESS}</span>
          </div>
          <div className={styles.statusItem}>
            <span>Done</span>
            <span className={styles.count}>{data.tasksByStatus.DONE}</span>
          </div>
        </div>
      </div>

      <div className={styles.recentProjects}>
        <h2>Recent Projects</h2>
        {data.recentProjects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <ul className={styles.projectList}>
            {data.recentProjects.map((project) => (
              <li key={project.id} className={styles.projectItem}>
                <h4>{project.name}</h4>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;