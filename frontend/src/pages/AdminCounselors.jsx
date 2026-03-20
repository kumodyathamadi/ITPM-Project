import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
    Users, LayoutGrid, Award, CalendarCheck, Settings, LogOut, 
    Search, Bell, HelpCircle, User, Plus, HeartPulse, Eye, Edit2, 
    ChevronLeft, ChevronRight
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

const AdminCounselors = () => {
    const [counselors, setCounselors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCounselors();
    }, []);

    const fetchCounselors = async () => {
        try {
            const res = await api.get('/api/admin/counselors');
            setCounselors(res.data);
        } catch (e) {
            console.error('Failed to fetch counselors', e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Derived statistics logic based on the image's layout mockup requirements
    const activeCount = counselors.filter(c => c.userId?.isActive).length;
    const totalCount = counselors.length;

    const filteredCounselors = counselors.filter(c => 
        c.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayCounselors = filteredCounselors;

    if (loading) return <div style={s.loading}><div style={s.spinner} />Loading directory…</div>;

    const isActiveNav = (path) => location.pathname === path;

    return (
        <div style={s.layout}>
            {/* Sidebar */}
            <div style={s.sidebar}>
                <div style={s.sidebarHeader}>
                    <h2 style={s.logoTitle}>Counselors Directory</h2>
                    
                </div>

                <div style={s.nav}>
                    <NavItem to="/admin-dashboard" icon={<LayoutGrid size={20} />} label="Dashboard" active={isActiveNav('/admin-dashboard')} />
                    <NavItem to="/admin-counselors" icon={<Users size={20} />} label="Counselors" active={true} />
                    <NavItem to="/admin-specialties" icon={<Award size={20} />} label="Specialties" />
                    <NavItem to="/admin-users" icon={<User size={20} />} label="Students" />
                    <NavItem to="/admin-appointments" icon={<CalendarCheck size={20} />} label="Appointments" />
                </div>

                
            </div>

            {/* Main Content Area */}
            <div style={s.mainWrapper}>
                

                {/* Page Content */}
                <div style={s.contentScroll}>
                    
                    {/* Page header */}
                    <div style={s.pageHeader}>
                        <div>
                            <h1 style={s.pageTitle}>Manage Counselors</h1>
                            <p style={s.pageSub}>Manage clinical staff, specializations, and availability status.</p>
                        </div>
                        <button style={s.primaryBtnDark}>
                            <Plus size={16} /> Add Counselor
                        </button>
                    </div>

                    {/* Top Widgets Row: Search & Active Badge */}
                    <div style={s.widgetsRow}>
                        {/* Custom Search Box */}
                        <div style={s.searchWidgetCard}>
                            <div style={s.thickSearchWrap}>
                                <input 
                                    style={s.thickInput} 
                                    placeholder="Search ..." 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Active Badge Card */}
                        <div style={s.activeBadgeCard}>
                            <div>
                                <div style={s.activeBadgeLabel}>ACTIVE NOW</div>
                                <div style={s.activeBadgeValue}>{activeCount} Counselors</div>
                            </div>
                            <div style={s.pulseIconWrap}>
                                <HeartPulse size={24} color="#0f766e" />
                            </div>
                        </div>
                    </div>

                    {/* Main Table Card */}
                    <div style={s.tableContainer}>
                        <table style={s.table}>
                            <thead>
                                <tr style={s.theadTr}>
                                    <th style={s.th}>NAME & PROFILE</th>
                                    <th style={s.th}>SPECIALTIES</th>
                                    <th style={s.th}>AVAILABILITY</th>
                                    <th style={{...s.th, textAlign: 'right'}}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayCounselors.map((c, i) => {
                                    // Parse specialties into pills if it's a comma separated string
                                    const specString = c.specialty || '';
                                    const specs = specString ? specString.split(',').map(s => s.trim()) : ['General'];
                                    
                                    // Determine status safely
                                    const isReal = !!c.userId;
                                    const name = c.userId?.name || 'Unknown Counselor';
                                    const initial = name.charAt(0);
                                    let statusType = 'active'; // active, leave, inactive
                                    
                                    if (c.userId?.statusStr === 'on_leave') statusType = 'leave';
                                    else if (c.userId?.isActive === false) statusType = 'inactive';
                                    else if (c.userId?.isActive === true) statusType = 'active';

                                    return (
                                        <tr key={c._id || i} style={s.tr}>
                                            <td style={s.td}>
                                                <div style={s.nameCell}>
                                                    <div style={s.avatarProfile}>{initial}</div>
                                                    <div>
                                                        <div style={s.profileName}>{name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={s.td}>
                                                <div style={s.pillGroup}>
                                                    {specs.map((sp, idx) => (
                                                        <span key={idx} style={s.specPill}>{sp}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={s.td}>
                                                {statusType === 'active' && (
                                                    <span style={s.availActive}>● ACTIVE</span>
                                                )}
                                                {statusType === 'leave' && (
                                                    <span style={s.availLeave}>● ON LEAVE</span>
                                                )}
                                                {statusType === 'inactive' && (
                                                    <span style={s.availInactive}>● INACTIVE</span>
                                                )}
                                            </td>
                                            <td style={{...s.td, textAlign: 'right'}}>
                                                <div style={s.actionBtns}>
                                                    <button style={s.iconActionBtn}><Eye size={16} /></button>
                                                    <button style={s.iconActionBtn}><Edit2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {/* Pagination footer */}
                        <div style={s.paginationWrap}>
                            <span style={s.pageText}>Showing {displayCounselors.length} of {totalCount} Counselors</span>
                            <div style={s.pageControls}>
                                <button style={s.pageArrow}><ChevronLeft size={16} /></button>
                                <button style={s.pageNumberActive}>1</button>
                                <button style={s.pageNumber}>2</button>
                                <button style={s.pageNumber}>3</button>
                                <button style={s.pageArrow}><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </div>

                    

                </div>
            </div>
        </div>
    );
};

// Styling Object deeply mirroring the aesthetic of the provided image
const s = {
    // Layout specifics
    layout: { display: 'flex', height: '100%', width: '100%', backgroundColor: '#f8fafc', overflow: 'hidden' },
    sidebar: { width: '250px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 },
    sidebarHeader: { padding: '1.5rem 1.5rem'},
    logoTitle: { fontSize: '1.00rem', fontWeight: 800, color: '#7700ffff', margin: 0, letterSpacing: '-0.02em' },
    logoSub: { fontSize: '0.75rem', color: '#64748b', margin: 0, marginTop: '0.2rem', fontWeight: 500 },
    nav: { display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem', flex: 1 },
    navItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', borderRadius: '0.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s' },
    navItemActive: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', borderRadius: '0.5rem', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' },
    bottomNav: { padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
    
    // Main Area
    mainWrapper: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topBar: { height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2.5rem', flexShrink: 0, borderBottom: '1px solid transparent' },
    searchContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#e2e8f0', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', width: '380px', gap: '0.6rem' },
    searchInput: { border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%', color: '#0f172a', fontWeight: 500 },
    topActions: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
    iconBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', padding: 0 },
    avatarUser: { width: 34, height: 34, borderRadius: '50%', border: '2px solid white', backgroundColor: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' },

    contentScroll: { flex: 1, overflowY: 'auto', padding: '1rem 2.5rem 3rem 2.5rem' },
    loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', minHeight: '40vh', color: '#64748b', fontSize: '1rem' },
    spinner: { width: 24, height: 24, border: '3px solid #e2e8f0', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    
    // Header
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    pageTitle: { fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '0.4rem' },
    pageSub: { color: '#475569', fontSize: '0.95rem' },
    primaryBtnDark: {
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none',
        background: '#0f172a', color: 'white',
        fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
    },

    // Upper Widgets Row
    widgetsRow: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' },
    searchWidgetCard: { background: 'white', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center' },
    thickSearchWrap: { width: '100%', maxWidth: '320px', border: '3px solid #0f172a', padding: '0.75rem 1rem' },
    thickInput: { width: '100%', border: 'none', outline: 'none', fontSize: '1rem', fontWeight: 700, color: '#0f172a' },
    activeBadgeCard: { background: '#a7f3d0', borderRadius: '12px', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    activeBadgeLabel: { fontSize: '0.75rem', fontWeight: 700, color: '#047857', letterSpacing: '0.05em', marginBottom: '0.2rem' },
    activeBadgeValue: { fontSize: '1.5rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.02em' },
    pulseIconWrap: { width: 44, height: 44, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    // Main Table
    tableContainer: { background: 'white', borderRadius: '12px', overflow: 'hidden', marginBottom: '2.5rem' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
    theadTr: { borderBottom: '1px solid #f1f5f9' },
    th: { padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' },
    tr: { borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' },
    td: { padding: '1rem 2rem', verticalAlign: 'middle' },
    
    // Directory Profile cell inline
    nameCell: { display: 'flex', alignItems: 'center', gap: '1rem' },
    avatarProfile: { width: 40, height: 40, borderRadius: '8px', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 },
    profileName: { fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' },
    profileSubtext: { color: '#64748b', fontSize: '0.8rem', marginTop: '0.15rem' },
    
    // Specialties
    pillGroup: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    specPill: { background: '#f1f5f9', color: '#334155', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
    
    // Availability tags
    availActive: { background: '#a7f3d0', color: '#047857', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block', minWidth: '95px', textAlign: 'center' },
    availLeave: { background: '#dbeafe', color: '#1d4ed8', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block', minWidth: '95px', textAlign: 'center' },
    availInactive: { background: '#e2e8f0', color: '#334155', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block', minWidth: '95px', textAlign: 'center' },
    
    // Actions
    actionBtns: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' },
    iconActionBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' },

    // Pagination
    paginationWrap: { padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderTop: 'none' },
    pageText: { fontSize: '0.85rem', color: '#475569', fontWeight: 500 },
    pageControls: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    pageArrow: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '0 0.25rem' },
    pageNumber: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
    pageNumberActive: { background: 'none', border: 'none', color: '#0f172a', fontSize: '0.85rem', fontWeight: 800, cursor: 'default' },

    // Bottom Stats
    bottomStatsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' },
    bottomCard: { background: 'white', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column' },
    bottomCardTitle: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: '#0f172a', marginBottom: '1.5rem' },
    bottomCardFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 },
    bottomCardValue: { fontSize: '1rem', fontWeight: 700 },
    progressBarWrap: { height: '6px', background: '#f1f5f9', borderRadius: '999px', width: '100%', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '999px' },
    manifestoText: { fontSize: '0.9rem', fontStyle: 'italic', color: '#475569', lineHeight: 1.5, marginBottom: '1rem' },
    manifestoAuthor: { fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' },
};

export default AdminCounselors;
