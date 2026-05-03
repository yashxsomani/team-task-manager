import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TaskBoard.module.css';

const TaskBoard = ({ projectId, isAdmin }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/tasks`);
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/projects/${projectId}/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleAssigneeChange = async (taskId, assigneeId) => {
    try {
      await axios.put(`/api/projects/${projectId}/tasks/${taskId}`, { assigneeId });
      fetchTasks();
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/projects/${projectId}/tasks/${taskId}`);
        fetchTasks();
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) return <div className={styles.loading}>Loading tasks...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.taskBoard}>
      <h2>Tasks</h2>
      <div className={styles.columns}>
        {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
          <div key={status} className={styles.column}>
            <h3>{status.replace('_', ' ')}</h3>
            <div className={styles.taskList}>
              {getTasksByStatus(status).map(task => (
                <div key={task.id} className={styles.taskCard}>
                  <h4>{task.title}</h4>
                  {task.description && <p>{task.description}</p>}
                  <div className={styles.taskMeta}>
                    {task.assignee && <span>Assignee: {task.assignee.name}</span>}
                    {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                  </div>
                  <div className={styles.taskActions}>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;