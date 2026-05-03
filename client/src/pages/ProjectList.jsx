import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import styles from "./ProjectList.module.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/projects", newProject);
      setNewProject({ name: "", description: "" });
      setShowCreateForm(false);
      fetchProjects();
    } catch (err) {
      setError("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Projects</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={styles.createButton}
        >
          {showCreateForm ? "Cancel" : "Create Project"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateProject} className={styles.createForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Project Name</label>
            <input
              type="text"
              id="name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
          </div>
          <button type="submit" disabled={creating} className={styles.submitButton}>
            {creating ? "Creating..." : "Create Project"}
          </button>
        </form>
      )}

      <div className={styles.projectGrid}>
        {projects.length === 0 ? (
          <p>No projects yet. Create your first project!</p>
        ) : (
          projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className={styles.projectCard}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className={styles.projectStats}>
                <span>{project.members ? project.members.length : 0} members</span>
                <span>{project._count ? project._count.tasks : 0} tasks</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectList;
