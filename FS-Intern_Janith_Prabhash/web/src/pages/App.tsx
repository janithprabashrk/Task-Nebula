import React, { useEffect, useMemo, useState } from 'react';
import '../styles.css';

const API_URL = 'http://localhost:4000';

function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<any>(() => {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  });
  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };
  return { token, user, login, logout };
}

export function App() {
  const { token, user, login, logout } = useAuth();
  const [email, setEmail] = useState('admin@demo.test');
  const [password, setPassword] = useState('Passw0rd!');
  const [projects, setProjects] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = useMemo(() => (
    { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' } as Record<string, string>
  ), [token]);

  async function fetchAuth(input: RequestInfo | URL, init?: RequestInit) {
    const res = await fetch(input, init);
    if (res.status === 401) {
      // Token is invalid/stale; force logout to return to sign-in
      logout();
      throw new Error('Unauthorized');
    }
    return res;
  }

  useEffect(() => {
    if (!token) return;
    setLoading(true); setError(null);
    fetchAuth(`${API_URL}/projects?q=${encodeURIComponent(q)}`, { headers })
      .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json(); })
      .then(setProjects)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [token, q]);

  useEffect(() => {
    if (!token || user?.role !== 'admin') return;
    fetchAuth(`${API_URL}/projects/users`, { headers })
      .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json(); })
      .then(setUsers)
  .catch(() => {});
  }, [token, user?.role]);

  const loadTasks = (projectId: number) => {
    setLoading(true); setError(null);
  fetchAuth(`${API_URL}/projects/${projectId}/tasks`, { headers })
      .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json(); })
      .then((ts) => { setTasks(ts); })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  const onCreateTask = async (title: string) => {
    if (!selectedProject) return;
  const res = await fetchAuth(`${API_URL}/projects/${selectedProject.id}/tasks`, { method: 'POST', headers, body: JSON.stringify({ title }) });
    if (!res.ok) { alert('Failed to create'); return; }
    const t = await res.json();
    setTasks((prev) => [t, ...prev]);
  };

  const onEditTask = async (task: any, updates: any) => {
  const canEdit = user?.role === 'admin' || task.assigneeUserId === user?.id;
  if (!canEdit) return;
    const orig = [...tasks];
    const idx = tasks.findIndex((t) => t.id === task.id);
    const next = { ...task, ...updates, version: task.version + 1 };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? next : t)));
  const res = await fetchAuth(`${API_URL}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'If-Match': String(task.version) },
      body: JSON.stringify(updates),
    });
    if (res.status === 409) {
      alert('Version conflict — reloading task');
      setTasks(orig);
      loadTasks(selectedProject.id);
      return;
    }
    if (!res.ok) {
      alert('Update failed'); setTasks(orig);
    }
  };

  if (!token) {
    return <AuthScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} onSignIn={() => login(email, password)} />;
  }

  return (
    <div className="app">
      <aside className="sidebar panel stack">
        <div className="row">
          <strong>Projects</strong>
          <button className="btn ghost" onClick={logout}>Logout</button>
        </div>
        <label htmlFor="search">Search</label>
        <input id="search" className="input" placeholder="search" value={q} onChange={(e) => setQ(e.target.value)} />
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        <ul className="list">
          {projects.length === 0 && !loading && !error && (
            <li className="item"><span className="muted">No projects found</span></li>
          )}
          {projects.map((p) => (
            <li className="item" key={p.id}>
              <button
                className={`btn item-btn${selectedProject?.id === p.id ? ' active' : ''}`}
                onClick={() => { setSelectedProject(p); loadTasks(p.id); }}
              >
                <span className="item-title">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="main panel">
        {selectedProject ? (
          <div className="stack">
            <div className="row g0">
              <h2>{selectedProject.name}</h2>
            </div>
            <p className="muted">{selectedProject.description}</p>

            <section>
              <h3>Tasks</h3>
              <NewTaskForm onCreate={onCreateTask} />
              <ul className="list">
                {tasks.length === 0 && !loading && (
                  <li className="item"><span className="muted">No tasks yet</span></li>
                )}
                {tasks.map((t) => (
                  <li className="item task-item" key={t.id}>
                    <div className="grid2">
                      {(() => {
                        const canEdit = user?.role === 'admin' || t.assigneeUserId === user?.id;
                        return (
                          <div className="task-left">
                            <input
                              aria-label="Task title"
                              className="input task-title"
                              value={t.title}
                              disabled={!canEdit}
                              onChange={(e) => onEditTask(t, { title: e.target.value })}
                            />
                            <div className="task-meta">
                              <span className={`status-pill ${t.status}`}>{String(t.status).replace('_',' ')}</span>
                              <span className="muted">v{t.version}</span>
                              {user?.role !== 'admin' && t.assigneeUserId !== user?.id && (
                                <span className="chip">read-only</span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                      <div className="row g8 task-actions">
                        <label className="muted" htmlFor={`status-${t.id}`}>Status</label>
                        {(() => {
                          const canEdit = user?.role === 'admin' || t.assigneeUserId === user?.id;
                          return (
                            <select
                              id={`status-${t.id}`}
                              className="select"
                              value={t.status}
                              disabled={!canEdit}
                              onChange={(e) => onEditTask(t, { status: e.target.value })}
                            >
                              <option value="todo">todo</option>
                              <option value="in_progress">in_progress</option>
                              <option value="done">done</option>
                            </select>
                          );
                        })()}
                        {user?.role === 'admin' && (
                          <AssigneeEditor users={users} task={t} onSave={(assigneeUserId) => onEditTask(t, { assigneeUserId })} />
                        )}
                        {(user?.role === 'admin' || t.assigneeUserId === user?.id) && (
                          <button className="btn ghost" onClick={async () => {
                            const orig = [...tasks];
                            setTasks(tasks.filter(x => x.id !== t.id));
                            const res = await fetchAuth(`${API_URL}/tasks/${t.id}`, { method: 'DELETE', headers });
                            if (!res.ok && res.status !== 204) {
                              setTasks(orig);
                              alert('Delete failed');
                            }
                          }}>Delete</button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <p>Select a project</p>
        )}
      </main>
    </div>
  );
}

function NewTaskForm({ onCreate }: { onCreate: (title: string) => void }) {
  const [title, setTitle] = useState('');
  return (
    <div className="row">
      <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task title" />
      <button className="btn brand" onClick={() => { if (title.trim()) { onCreate(title.trim()); setTitle(''); } }}>Add</button>
    </div>
  );
}

function AssigneeEditor({ users, task, onSave }: { users: any[]; task: any; onSave: (assigneeUserId: number) => void }) {
  const [assigneeUserId, setAssigneeUserId] = useState<number>(task.assigneeUserId);
  return (
    <>
      <label className="muted" htmlFor={`assignee-${task.id}`}>Assignee</label>
      <select id={`assignee-${task.id}`} className="select" value={assigneeUserId} onChange={(e) => setAssigneeUserId(Number(e.target.value))}>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
        ))}
      </select>
      <button className="btn" onClick={() => onSave(assigneeUserId)}>Assign</button>
    </>
  );
}

function AuthScreen({ email, setEmail, password, setPassword, onSignIn }: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onSignIn: () => void;
}) {
  const [show, setShow] = useState(false);
  const submit = (e: React.FormEvent) => { e.preventDefault(); onSignIn(); };
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head">
          <div className="logo-dot" aria-hidden="true" />
          <h1 className="brand-gradient">Sign in</h1>
          <p className="muted">Access your projects dashboard</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
          />
          <label htmlFor="password" className="label">Password</label>
          <div className="password-row">
            <input
              id="password"
              className="input"
              placeholder="••••••••"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" className="btn ghost toggle" onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Show'}</button>
          </div>
          <button className="btn brand block" type="submit">Sign in</button>
          <div className="demo-hint">Demo: <span>admin@demo.test</span> / <span>Passw0rd!</span></div>
        </form>
      </div>
    </div>
  );
}
