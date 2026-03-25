import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users,
  Activity,
  CheckCircle,
  Clock,
  Plus,
  X,
  UserPlus,
  Star,
  LayoutGrid,
  Award,
  CalendarCheck,
  Settings,
  LogOut,
  Search,
  Bell,
  HelpCircle,
  User,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  sub,
  isDark,
  leftBorder,
  icon,
  gradient,
  borderColor,
  textColor,
}) => (
  <div
    style={{
      ...s.statCard,
      background:
        gradient ||
        (isDark
          ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
          : "white"),
      borderLeft: leftBorder
        ? `6px solid ${borderColor || "#0f172a"}`
        : isDark
          ? "none"
          : "1px solid #e2e8f0",
      color: textColor || (isDark ? "white" : "#0f172a"),
      boxShadow: isDark
        ? "0 10px 25px -5px rgba(15, 23, 42, 0.4)"
        : "0 10px 20px -5px rgba(0, 0, 0, 0.08)",
      border: isDark ? "1px solid #334155" : "1px solid #f8fafc",
    }}
  >
    <div style={s.statBody}>
      <div
        style={{
          ...s.statLabel,
          color: isDark ? "#cbd5e1" : textColor || "#475569",
        }}
      >
        {title}
      </div>
      <div
        style={{
          ...s.statValue,
          color: isDark ? "white" : textColor || "#0f172a",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            ...s.statSub,
            color: isDark ? "#94a3b8" : textColor || "#64748b",
          }}
        >
          {sub}
        </div>
      )}
    </div>
    {icon && <div style={s.statIconBg}>{icon}</div>}
  </div>
);

const NavItem = ({ icon, label, to, active, onClick }) => {
  const Component = to ? Link : "div";
  return (
    <Component
      to={to}
      style={{
        ...(active ? s.navItemActive : s.navItem),
        textDecoration: "none",
      }}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Component>
  );
};

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: '',
    specialty: "",
    photo: null,
    photoPreview: null,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00-10:00", "13:00-14:00"],
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, counselorsRes, specialtiesRes, appointmentsRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/counselors"),
        api.get("/api/admin/specialties"),
        api.get("/api/admin/appointments"),
      ]);
      setStats(statsRes.data);
      setCounselors(counselorsRes.data);
      setSpecialties(specialtiesRes.data);
      setAppointments(appointmentsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Full Name validation: alphabets and spaces only, min 3 chars
    if (!formData.name.trim()) errors.name = 'Full Name is required';
    else if (!/^[a-zA-Z\s]{3,}$/.test(formData.name)) errors.name = 'Name must be at least 3 characters and contain only letters';

    // Email Address validation
    if (!formData.email.trim()) errors.email = 'Email Address is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Invalid email format';

    // Password validation: min 8 length, 1 uppercase, 1 lowercase, 1 number, 1 special char
    if (!formData.password) errors.password = 'Password is required';
    else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}/.test(formData.password)) {
        errors.password = 'Password must be at least 8 chars with uppercase, lowercase, number, and special character';
    }

    // Phone Number validation: exactly 10 digits
    if (!formData.phone.trim()) errors.phone = 'Phone Number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
        errors.phone = 'Phone Number must be 10 digits';
    }

    // Specialty validation
    if (!formData.specialty) errors.specialty = 'Specialty is required';

    // Profile Photo validation
    // if (formData.photo) {
    //     errors.photo = 'Profile Photo is required';
    // }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCounselor = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await api.post("/api/admin/counselors", formData);
      setShowForm(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: '',
        specialty: "",
        photo: null,
        photoPreview: null,
        availableDays: ["Monday"],
        availableTimeSlots: ["09:00-10:00"],
      });
      setFormErrors({});
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Error creating counselor");
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/api/admin/users/${userId}/status`, {
        isActive: !currentStatus,
      });
      fetchData();
    } catch {
      alert("Error updating status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const monthlyData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = {};
    appointments.forEach(app => {
      const d = new Date(app.date);
      const m = monthNames[d.getMonth()];
      counts[m] = (counts[m] || 0) + 1;
    });
    return monthNames.map(m => ({ name: m, appointments: counts[m] || 0 }));
  }, [appointments]);

  const counselorData = useMemo(() => {
    const counts = {};
    appointments.forEach(app => {
      const name = app.counselorId?.userId?.name || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, value: count }));
  }, [appointments]);

  const COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f97316", "#ef4444", "#0ea5e9"];

  if (loading)
    return (
      <div style={s.loading}>
        <div style={s.spinner} />
        Loading dashboard…
      </div>
    );

  return (
    <div style={s.layout}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.nav}>
          <NavItem
            to="/admin-dashboard"
            icon={<LayoutGrid size={20} />}
            label="Dashboard"
            active={location.pathname === "/admin-dashboard"}
          />
          <NavItem
            to="/admin-counselors"
            icon={<Users size={20} />}
            label="Counselors"
          />
          <NavItem
            to="/admin-specialties"
            icon={<Award size={20} />}
            label="Specialties"
          />
          <NavItem
            to="/admin-users"
            icon={<User size={20} />}
            label="Students"
          />
          <NavItem
            to="/admin-appointments"
            icon={<CalendarCheck size={20} />}
            label="Appointments"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={s.mainWrapper}>
        {/* Topbar */}
        <div style={s.topBar}>
          <div style={s.searchContainer}>
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search..." style={s.searchInput} />
          </div>
        </div>

        {/* Page Content */}
        <div style={s.contentScroll}>
          {/* Page header */}
          <div style={s.pageHeader}>
            <div>
              <h1 style={s.pageTitle}>Counseling System Admin Panel</h1>
              <p style={s.pageSub}>
                Oversee counselor management, assign specialties, track usage &
                ensure smooth operation.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button style={s.exportBtn}>Export Report</button>
              <button
                style={showForm ? s.cancelBtn : s.primaryBtn}
                onClick={() => {
                  setShowForm(!showForm);
                  setFormErrors({});
                }}
              >
                {showForm ? (
                  <>
                    <X size={16} /> Cancel
                  </>     /*Form is open → button lets you cancel it*/
                ) : (
                  <>
                    <Plus size={16} /> Add Counselor
                  </>     /*Form is closed → button lets you open it*/
                )}
              </button>
            </div>
          </div>

          {/* Stat cards replicated from design */}
          {stats && (
            <div style={s.statsGrid}>
              <StatCard
                title="TOTAL APPOINTMENTS"
                value={stats.appointments.total || 240}
                sub={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: 500,
                    }}
                  >
                    <CheckCircle size={14} color="#1c3087ff" /> Total No of
                    Appoinments
                  </span>
                }
                leftBorder={true}
                gradient="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                borderColor="#3b82f6"
                textColor="#1e3a8a"
              />
              <StatCard
                title="ACTIVE COUNSELORS"
                value={stats.users.counselors || 18}
                sub={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: 500,
                    }}
                  >
                    <CheckCircle size={14} color="#581c87" /> Full availability
                    today
                  </span>
                }
                leftBorder={true}
                gradient="linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)"
                borderColor="#8b5cf6"
                textColor="#581c87"
              />
              <StatCard
                title="TOTAL STUDENTS"
                value={stats.users.students || 0}
                sub={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span style={{ color: "#059669", fontWeight: 600 }}>
                      ↗ Registered
                    </span>{" "}
                    users
                  </span>
                }
                leftBorder={true}
                gradient="linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                borderColor="#22c55e"
                textColor="#14532d"
              />
              <StatCard
                title="ACTIVE SPECIALTIES"
                value={specialties.length || 0}
                sub={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: 500,
                    }}
                  >
                    <CheckCircle size={14} color="#9a3412" /> Unique clinical
                    focuses
                  </span>
                }
                leftBorder={true}
                gradient="linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)"
                borderColor="#f97316"
                textColor="#9a3412"
              />
            </div>
          )}

          {/* Charts Section */}
          {!loading && appointments && (
            <div style={s.chartsGrid}>
              <div style={s.chartCard}>
                <h3 style={s.chartTitle}>Appointments over time (monthly)</h3>
                <div style={s.chartWrapper}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={s.chartCard}>
                <h3 style={s.chartTitle}>Sessions per counselor</h3>
                <div style={s.chartWrapper}>
                  {counselorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={counselorData}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {counselorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>
                      No session data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add Counselor Form */}
          {showForm && (
            <div style={s.formCard}>
              <div style={s.formCardHeader}>
                <UserPlus size={20} />
                <h3 style={{ margin: 0 }}>Add New Counselor</h3>
              </div>
              <form onSubmit={handleCreateCounselor} style={s.formGrid}>
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Email Address', key: 'email', type: 'email' },
                  { label: 'Password', key: 'password', type: 'password' },
                  { label: 'Phone Number', key: 'phone', type: 'tel' },
                  { label: 'Specialty', key: 'specialty', type: 'select' },
                  { label: 'Profile Photo', key: 'photo', type: 'file' },
                ].map(({ label, key, type }) => (
                  <div key={key} style={s.fieldGroup}>
                    <label style={s.label}>{label}</label>
                    {type === 'select' ? (
                      <select
                        style={formErrors[key] ? {...s.input, borderColor: '#ef4444'} : s.input}
                        value={formData[key]}
                        onChange={e => {
                          setFormData({ ...formData, [key]: e.target.value });
                          if (formErrors[key]) setFormErrors({...formErrors, [key]: null});
                        }}
                      >
                        <option value="" disabled>Select a specialty...</option>
                        {specialties.map(spec => (
                          <option key={spec._id} value={spec.name}>{spec.name}</option>
                        ))}
                      </select>
                    ) : type === 'file' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.2rem' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {formData.photoPreview ? (
                            <img src={formData.photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={32} color="#94a3b8" />
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto', alignItems: 'center' }}>
                          {formData.photoPreview && (
                            <button 
                              type="button" 
                              onClick={() => setFormData({...formData, photo: null, photoPreview: null})}
                              style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                              Remove photo
                            </button>
                          )}
                          <label style={{
                            padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#0f172a', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'inline-block'
                          }}>
                            {formData.photoPreview ? 'Change photo' : 'Change photo'}
                            <input 
                              type="file" 
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setFormData({ ...formData, photo: file, photoPreview: reader.result });
                                    if (formErrors[key]) setFormErrors({...formErrors, [key]: null});
                                  }
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <input
                        type={type}
                        style={formErrors[key] ? {...s.input, borderColor: '#ef4444'} : s.input}
                        value={formData[key]}
                        onChange={e => {
                          setFormData({ ...formData, [key]: e.target.value });
                          if (formErrors[key]) setFormErrors({...formErrors, [key]: null});
                        }}
                        placeholder={label}
                      />
                    )}
                    {formErrors[key] && <span style={s.errorText}>{formErrors[key]}</span>}
                  </div>
                ))}
                <div style={{ gridColumn: '1/-1', marginTop: '1rem' }}>
                  <button type="submit" style={s.primaryBtn}>
                    <Plus size={16} /> Submit
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Placeholder image */}
          <div style={s.imagePlaceholderContainer}>
            <img
              src="https://i.pinimg.com/736x/b8/bc/93/b8bc93ff14ff1520e6427dd91f2780aa.jpg"
              alt="Counseling Dashboard Cover"
              style={s.coverImage}
            />
          </div>

          {/* Counselors Table Styled like 'Top Performing Counselors' */}
          <div style={s.tableSection}>
            <h3 style={s.sectionTitle}>Top Performing Counselors</h3>
            <div style={s.tableContainer}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>COUNSELOR</th>
                    <th style={s.th}>EMAIL</th>
                    <th style={s.th}>SPECIALTY</th>
                    <th style={s.th}>STATUS</th>
                    <th style={s.th}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {counselors.map((c, index) => {
                    return (
                      <tr key={c._id} style={s.tr}>
                        <td style={s.td}>
                          <div style={s.nameCell}>
                            <div style={s.avatarSmall}>
                              {c.userId?.name?.charAt(0) || "C"}
                            </div>
                            <span style={s.counselorName}>
                              {c.userId?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td style={{ ...s.td, color: "#64748b" }}>
                          {c.userId?.email}
                        </td>
                        <td style={{ ...s.td, color: "#020f22ff" }}>
                          {c.specialty}
                        </td>
                        <td style={s.td}>
                          <span
                            style={
                              c.userId?.isActive
                                ? s.badgeAvailable
                                : s.badgeUnavailable
                            }
                          >
                            {c.userId?.isActive ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <button
                            onClick={() =>
                              toggleStatus(c.userId._id, c.userId.isActive)
                            }
                            style={
                              c.userId?.isActive
                                ? s.deactivateBtn
                                : s.activateBtn
                            }
                          >
                            {c.userId?.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {counselors.length === 0 && (
                <div style={s.emptyState}>
                  <Users size={40} color="#cbd5e1" />
                  <p style={{ color: "#94a3b8", marginTop: "0.75rem" }}>
                    No counselors registered yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  // Layout specifics
  layout: {
    display: "flex",
    height: "100%",
    width: "100%",
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  sidebarHeader: { padding: "1.5rem 1.5rem" },
  logoTitle: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  logoSub: {
    fontSize: "0.75rem",
    color: "#64748b",
    margin: 0,
    marginTop: "0.2rem",
    fontWeight: 500,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    padding: "0 1rem",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.8rem 1rem",
    borderRadius: "0.5rem",
    color: "#64748b",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  navItemActive: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.8rem 1rem",
    borderRadius: "0.5rem",
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  bottomNav: {
    padding: "1.5rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },

  // Main Area
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topBar: {
    height: "70px",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    flexShrink: 0,
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    padding: "0.55rem 1rem",
    borderRadius: "0.5rem",
    width: "320px",
    gap: "0.5rem",
  },
  searchInput: {
    border: "none",
    backgroundColor: "transparent",
    outline: "none",
    fontSize: "0.85rem",
    width: "100%",
    color: "#0f172a",
    fontWeight: 500,
  },
  topActions: { display: "flex", alignItems: "center", gap: "1.25rem" },
  iconBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    padding: 0,
  },
  avatarUser: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    backgroundColor: "#fed7aa",
    color: "#ea580c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.85rem",
  },

  contentScroll: { flex: 1, overflowY: "auto", padding: "0 2rem 2rem 2rem" },

  // Existing components rewritten slightly
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    minHeight: "40vh",
    color: "#64748b",
    fontSize: "1rem",
  },
  spinner: {
    width: 24,
    height: 24,
    border: "3px solid #e2e8f0",
    borderTopColor: "#4F46E5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
    paddingTop: "1rem",
  },
  pageTitle: {
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.03em",
    marginBottom: "0.25rem",
  },
  pageSub: { color: "#64748b", fontSize: "0.9rem" },

  exportBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.65rem 1.25rem",
    borderRadius: "10px",
    border: "none",
    background: "#e2e8f0",
    color: "#475569",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.65rem 1.25rem",
    borderRadius: "8px",
    border: "none",
    background: "#0f172a",
    color: "white",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  cancelBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.65rem 1.25rem",
    borderRadius: "8px",
    border: "1.5px solid #e2e8f0",
    background: "white",
    color: "#64748b",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
  },

  // Stats Grid
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "1.25rem",
    marginBottom: "2.5rem",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "1.25rem",
    marginBottom: "2.5rem",
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    border: "1px solid #f8fafc",
    display: "flex",
    flexDirection: "column",
  },
  chartTitle: {
    margin: "0 0 1.5rem 0",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  chartWrapper: {
    width: "100%",
    height: "300px",
  },
  statCard: {
    borderRadius: "12px",
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    transition: "transform 0.2s, box-shadow 0.2s",
    position: "relative",
    overflow: "hidden",
  },
  statBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    zIndex: 1,
  },
  statLabel: { fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" },
  statValue: {
    fontSize: "2.5rem",
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: "-0.03em",
  },
  statSub: { fontSize: "0.8rem", marginTop: "0.25rem" },
  statIconBg: {
    position: "absolute",
    right: "1.5rem",
    bottom: "1.5rem",
    opacity: 0.2,
  },
  capacityChartIcon: {
    display: "flex",
    alignItems: "flex-end",
    gap: "4px",
    height: "40px",
  },
  bar: { width: "8px", backgroundColor: "white", borderRadius: "2px" },

  // Image placeholder
  imagePlaceholderContainer: {
    width: "100%",
    height: "240px",
    borderRadius: "1rem",
    overflow: "hidden",
    marginBottom: "2.5rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  coverImage: { width: "100%", height: "100%", objectFit: "cover" },

  // Add Counselor Form
  formCard: {
    background: "white",
    borderRadius: "1rem",
    padding: "1.75rem",
    marginBottom: "2rem",
    boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
    border: "2px solid #e2e8f0",
  },
  formCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "1.05rem",
    marginBottom: "1.5rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "1rem",
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#374151" },
  input: {
    padding: "0.7rem 1rem",
    border: "1.5px solid #e2e8f0",
    borderRadius: "0.65rem",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "inherit",
    color: "#0f172a",
    transition: "border-color 0.2s",
  },
  errorText: { color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, marginTop: '0.2rem' },

  // Table section
  tableSection: { marginBottom: "2rem" },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "1.25rem",
  },
  tableContainer: {
    background: "white",
    borderRadius: "1rem",
    boxShadow: "0 2px 14px rgba(0,0,0,0.04)",
    overflowX: "auto",
    border: "1px solid #f8fafc",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "940px" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  th: {
    padding: "1rem 1.5rem",
    textAlign: "left",
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" },
  td: { padding: "1rem 1.5rem", fontSize: "0.875rem", verticalAlign: "middle" },
  nameCell: { display: "flex", alignItems: "center", gap: "0.75rem" },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#0f172a",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.9rem",
    flexShrink: 0,
  },
  counselorName: { fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" },
  badgeAvailable: {
    background: "#5eead4",
    color: "#042f2e",
    padding: "0.25rem 0.8rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  badgeUnavailable: {
    background: "#e2e8f0",
    color: "#475569",
    padding: "0.25rem 0.8rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  deactivateBtn: {
    padding: "0.4rem 0.85rem",
    borderRadius: "7px",
    border: "1px solid #e2e8f0",
    background: "transparent",
    color: "#64748b",
    fontWeight: 600,
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  activateBtn: {
    padding: "0.4rem 0.85rem",
    borderRadius: "7px",
    border: "none",
    background: "#0f172a",
    color: "white",
    fontWeight: 600,
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "3rem",
    color: "#94a3b8",
  },
};

export default AdminDashboard;
