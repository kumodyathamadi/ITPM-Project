import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
    Users, LayoutGrid, Award, CalendarCheck, User, 
    Bell, HelpCircle, Search, Filter, Video, Building2, TrendingUp, Clock,
    Radio
} from 'lucide-react';

const NavItem = ({ icon, label, to, active, onClick }) => {
    const Component = to ? Link : 'div';
    return (
        <Component 
            to={to}
            style={{...(active ? s.navItemActive : s.navItem), textDecoration: 'none'}}
            onClick={onClick}
        >
            {icon}
            <span>{label}</span> 
        </Component>
    );
};

const AdminAppointments = () => {
    const location = useLocation();
    
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/api/admin/appointments');
            setAppointments(res.data);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const isActiveNav = (path) => location.pathname === path;

    if (loading) return <div style={{...s.layout, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading...</div>;

    const activeCount = appointments.filter(a => a.status === 'approved').length;
    const pendingCount = appointments.filter(a => a.status === 'pending').length;
    const cancelledCount = appointments.filter(a => a.status === 'cancelled' || a.status === 'rejected').length;
    const completedCount = appointments.filter(a => a.status === 'completed').length;

    return (
        <div style={s.layout}>
            {/* Sidebar */}
            <div style={s.sidebar}>
                <div style={s.sidebarHeader}>
                    <h2 style={s.logoTitle}>Appointments Directory</h2>
                </div>

                <div style={s.nav}>
                    <NavItem to="/admin-dashboard" icon={<LayoutGrid size={20} />} label="Dashboard" active={isActiveNav('/admin-dashboard')} />
                    <NavItem to="/admin-counselors" icon={<Users size={20} />} label="Counselors" active={isActiveNav('/admin-counselors')} />
                    <NavItem to="/admin-specialties" icon={<Award size={20} />} label="Specialties" active={isActiveNav('/admin-specialties')} />
                    <NavItem to="/admin-users" icon={<User size={20} />} label="Students" active={isActiveNav('/admin-users')} />
                    <NavItem to="/admin-appointments" icon={<CalendarCheck size={20} />} label="Appointments" active={true} />
                </div>
            </div>

            {/* Main Content Area */}
            <div style={s.mainWrapper}>
                {/* Top Navbar */}
                <div style={s.topNav}>
                    <div style={s.searchContainer}>
                        <Search size={16} color="#94a3b8" />
                        <input type="text" placeholder="Search sessions or counselors..." style={s.searchInput} />
                    </div>
                    
                  
                </div>

                {/* Page Content */}
                <div style={s.contentScroll}>
                    {/* Page header */}
                    <div style={s.pageHeader}>
                        <div>
                            <h1 style={s.pageTitle}>Manage Appointments</h1>
                            <p style={s.pageSub}>Monitor upcoming and past sessions, handle bookings, and maintain an efficient counseling schedule.</p>
                        </div>
                       
                    </div>

                    {/* Main Layout Grid */}
                    <div style={s.gridContainer}>
                        {/* Left Column: Live Timeline */}
                        <div style={s.leftCol}>
                            <div style={s.timelineCard}>
                                <div style={s.timelineHeader}>
                                    <h3 style={s.cardTitle}>
                                        <Radio size={20} color="#0f172a" /> Live Timeline
                                    </h3>
                                    <span style={s.liveBadge}>
                                        <span style={s.liveDot}></span> LIVE NOW
                                    </span>
                                </div>
                                
                                <div style={s.timelineList}>
                                    {appointments.length === 0 ? (
                                        <div style={{color: '#64748b'}}>No appointments found.</div>
                                    ) : (
                                        appointments.map((apt) => {
                                            const patientName = apt.studentId?.name || 'Unknown';
                                            const doctorName = apt.counselorId?.userId?.name || 'Unknown';
                                            const doctorSpec = apt.counselorId?.specialty || 'General';
                                            
                                            const aptDate = new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            const timeLabel = aptDate === today ? 'TODAY' : aptDate;

                                            const isPending = apt.status === 'pending';
                                            const isApproved = apt.status === 'approved';
                                            const isCancelled = apt.status === 'cancelled' || apt.status === 'rejected';
                                            const isCompleted = apt.status === 'completed';

                                            let badgeStyle = s.statusBadgeScheduled;
                                            let badgeText = apt.status.charAt(0).toUpperCase() + apt.status.slice(1);
                                            let sessionStyle = s.sessionItemScheduled;

                                            if (isApproved) {
                                                badgeStyle = s.statusBadgeInProgress;
                                                sessionStyle = s.sessionItemActive;
                                            } else if (isCancelled) {
                                                badgeStyle = {...s.statusBadgeScheduled, backgroundColor: '#fef2f2', color: '#b91c1c'};
                                            } else if (isCompleted) {
                                                badgeStyle = {...s.statusBadgeScheduled, backgroundColor: '#f0fdf4', color: '#15803d'};
                                            }

                                            return (
                                                <div key={apt._id} style={sessionStyle}>
                                                    <div style={s.timeCol}>
                                                        <span style={s.timeLabel}>{timeLabel}</span>
                                                        <span style={s.timeValue}>{apt.time?.split('-')[0] || apt.time}</span>
                                                    </div>
                                                    <div style={s.doctorCol}>
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=random`} alt={doctorName} style={s.doctorImg} />
                                                        <div>
                                                            <div style={s.doctorName}>{doctorName}</div>
                                                            <div style={s.doctorSpec}>{doctorSpec}</div>
                                                        </div>
                                                    </div>
                                                    <div style={s.patientCol}>
                                                        <div style={s.patientName}>Patient: {patientName}</div>
                                                        <div style={s.locationText}><Video size={14} /> Virtual Session</div>
                                                    </div>
                                                    <div style={s.statusCol}>
                                                        <span style={badgeStyle}>{badgeText}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Widgets */}
                        <div style={s.rightCol}>
                            {/* Widget 1 */}
                            <div style={s.statsCard}>
                                <div style={s.statsLabel}>PENDING REQUESTS</div>
                                <div style={s.statsValue}>{pendingCount}</div>
                                <div style={s.statsTrendNeutral}>
                                    <Clock size={16} /> Awaiting counselor action
                                </div>
                            </div>
                            
                            {/* Widget 2: Cancelled */}
                            <div style={s.statsCard}>
                                <div style={s.statsLabel}>CANCELLED REQUESTS</div>
                                <div style={s.statsValue}>{cancelledCount}</div>
                                <div style={{...s.statsTrendNeutral, color: '#dc2626'}}>
                                    <Clock size={16} /> Needs attention
                                </div>
                            </div>

                            {/* Widget 3: Completed */}
                            <div style={s.statsCard}>
                                <div style={s.statsLabel}>COMPLETED SESSIONS</div>
                                <div style={s.statsValue}>{completedCount}</div>
                                <div style={s.statsTrendGreen}>
                                    <TrendingUp size={16} /> Successfully finished
                                </div>
                            </div>
                            
                           
                        </div>
                    </div>

                    {/* Banner Image */}
                    <div style={s.bannerContainer}>
                        <img src="https://i.pinimg.com/736x/7d/15/95/7d1595df9e7ac71ea834f15302235b4e.jpg" alt="Graduation" style={s.bannerImage} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Styling Object
const s = {
    // Layout specifics
    layout: { display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflow: 'hidden', fontFamily: '"Inter", "Segoe UI", sans-serif' },
    sidebar: { width: '250px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid #f1f5f9' },
    sidebarHeader: { padding: '2rem 1.5rem 1.5rem 1.5rem'},
    logoTitle: { fontSize: '1.00rem', fontWeight: 800, color: '#7700ffff', margin: 0, letterSpacing: '-0.02em' },
    logoSub: { fontSize: '0.75rem', color: '#64748b', margin: 0, marginTop: '0.2rem', fontWeight: 500 },
    nav: { display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem', flex: 1 },
    navItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', borderRadius: '0.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s' },
    navItemActive: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', borderRadius: '0.5rem', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' },
    
    // Main Area
    mainWrapper: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    contentScroll: { flex: 1, overflowY: 'auto', padding: '2.5rem 3rem 3rem 3rem' },
    
    // Top Nav
    topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 3rem', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9' },
    searchContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0.5rem 1rem', width: '400px' },
    searchInput: { border: 'none', outline: 'none', backgroundColor: 'transparent', marginLeft: '0.5rem', fontSize: '0.9rem', width: '100%', color: '#334155' },
    topNavRight: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
    topNavText: { fontWeight: 600, color: '#334155', fontSize: '0.95rem', marginRight: '1rem' },
    iconBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    profileDropdown: { display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginLeft: '0.5rem' },
    profileText: { fontWeight: 600, color: '#475569', fontSize: '0.9rem' },
    profileAvatar: { width: 32, height: 32, borderRadius: '50%', backgroundColor: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    // Header
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' },
    pageTitle: { fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '0.4rem' },
    pageSub: { color: '#475569', fontSize: '0.95rem' },
    headerActions: { display: 'flex', gap: '1rem' },
    btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' },

    // Layout Grid
    gridContainer: { display: 'grid', gridTemplateColumns: 'minmax(600px, 1.8fr) 1fr', gap: '2rem', marginBottom: '2.5rem' },
    leftCol: { display: 'flex', flexDirection: 'column' },
    rightCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },

    // Cards
    timelineCard: { backgroundColor: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },
    timelineHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    cardTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' },
    liveBadge: { backgroundColor: '#ccfbf1', color: '#0d9488', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.05em' },
    liveDot: { width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0d9488', boxShadow: '0 0 0 2px #ccfbf1' },

    // Timeline List
    timelineList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    
    // Session Items
    sessionItemActive: { display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1.25rem 1.5rem', borderLeft: '4px solid #0ea5e9', position: 'relative' },
    sessionItemScheduled: { display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid #f1f5f9', borderLeft: '4px solid #e2e8f0' },
    
    timeCol: { width: '80px', flexShrink: 0 },
    timeLabel: { display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.25rem' },
    timeValue: { display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' },

    doctorCol: { display: 'flex', alignItems: 'center', gap: '1rem', flex: 1.5, minWidth: '220px' },
    doctorImg: { width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' },
    doctorName: { fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.15rem' },
    doctorSpec: { color: '#64748b', fontSize: '0.8rem' },

    patientCol: { flex: 1.5 },
    patientName: { fontWeight: 600, color: '#334155', fontSize: '0.9rem', marginBottom: '0.25rem' },
    locationText: { display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem' },

    statusCol: { width: '110px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 },
    statusBadgeInProgress: { backgroundColor: '#a5f3fc', color: '#0891b2', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 },
    statusBadgeScheduled: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 },

    // Right Widgets
    statsCard: { backgroundColor: '#c9c4f7ff', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },
    statsLabel: { fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: '1rem' },
    statsValue: { fontSize: '3rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '1rem' },
    statsTrendGreen: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#059669' },
    statsTrendNeutral: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569' },
    whitePlaceholder: { backgroundColor: 'white', borderRadius: '16px', flex: 1, minHeight: '120px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },

    // Banner
    bannerContainer: { width: '100%', borderRadius: '16px', overflow: 'hidden', height: '280px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },
    bannerImage: { width: '100%', height: '100%', objectFit: 'cover' }
};

export default AdminAppointments;
