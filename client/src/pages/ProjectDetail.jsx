import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskBoard from '../components/TaskBoard';
import styles from './ProjectDetail.module.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ userId: '', role: 'MEMBER' });
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}`);
      setProject(response.data);
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/api/projects/${id}`);
        navigate('/projects');
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      await axios.post(`/api/projects/${id}/members`, newMember);
      setNewMember({ userId: '', role: 'MEMBER' });
      setShowAddMember(false);
      fetchProject();
    } catch (err) {
      setError('Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await axios.delete(`/api/projects/${id}/members/${userId}`);
        fetchProject();
      } catch (err) {
        setError('Failed to remove member');
      }
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!project) return null;

  const isAdmin = project.members.some(member => member.role === 'ADMIN');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{project.name}</h1>
        {project.description && <p>{project.description}</p>}
        {isAdmin && (
          <div className={styles.adminActions}>
            <button onClick={() => setShowAddMember(!showAddMember)} className={styles.button}>
              Add Member
            </button>
            <button onClick={handleDeleteProject} className={styles.deleteButton}>
              Delete Project
            </button>
          </div>
        )}
      </div>

      {showAddMember && (
        <form onSubmit={handleAddMember} className={styles.addMemberForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              value={newMember.userId}
              onChange={(e) => setNewMember({ ...newMember, userId: e.target.value })}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={addingMember} className={styles.submitButton}>
            {addingMember ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      )}

      <div className={styles.members}>
        <h2>Members</h2>
        <ul className={styles.memberList}>
          {project.members.map((member) => (
            <li key={member.userId} className={styles.memberItem}>
              <span>{member.user.name} ({member.user.email}) - {member.role}</span>
              {isAdmin && member.role !== 'ADMIN' && (
                <button
                  onClick={() => handleRemoveMember(member.userId)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <TaskBoard projectId={id} isAdmin={isAdmin} />
    </div>
  );
};

export default ProjectDetail;