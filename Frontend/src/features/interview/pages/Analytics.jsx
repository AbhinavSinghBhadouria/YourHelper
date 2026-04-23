
import React from 'react';
import '../style/analytics.css';
import { useAuth } from '../../auth/hooks/useAuth';
import { Link } from 'react-router-dom';

const Analytics = () => {
    const { user } = useAuth();
    const isPremium = user?.isPremium || false;

    // Mock data for placeholders
    const stats = [
        { label: "Avg. Match Score", value: "78%", trend: "+12%", up: true },
        { label: "Interviews Prepped", value: "14", trend: "+2", up: true },
        { label: "Readiness Index", value: "8.4", trend: "-0.2", up: false },
        { label: "Skills Tracked", value: "32", trend: "+5", up: true }
    ];

    return (
        <div className="analytics-page">
            <header className="analytics-header">
                <div>
                    <h1>Performance Analytics</h1>
                    <p>Track your growth and readiness across all interview dimensions.</p>
                </div>
                <div className="premium-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    {user?.plan?.toUpperCase() || 'FREE'} PLAN
                </div>
            </header>

            <div className="coming-soon-overlay">
                <div className="coming-soon-content">
                    <div className="coming-soon-badge">Alpha Feature</div>
                    <div className="rocket-icon">🚀</div>
                    <h2>Coming Soon</h2>
                    <p>We are building a powerful analytics engine to track your interview performance in real-time. Stay tuned!</p>
                    <Link to="/dashboard" className="btn-back-dashboard">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            <div className="analytics-content blurred">
                <div className="stats-grid">
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-card">
                            <p className="stat-card__label">{stat.label}</p>
                            <p className="stat-card__value">{stat.value}</p>
                            <p className={`stat-card__trend ${stat.up ? 'trend--up' : 'trend--down'}`}>
                                {stat.up ? '↑' : '↓'} {stat.trend} from last month
                            </p>
                        </div>
                    ))}
                </div>

                <div className="analytics-main-grid">
                    <div className="chart-container">
                        <h3>Skill Proficiency Radar</h3>
                        <div className="mock-chart-radar">
                            {/* Visual decorative lines for the radar chart mock */}
                            {[0, 60, 120, 180, 240, 300].map(deg => (
                                <div key={deg} className="mock-radar-line" style={{width: '150px', transform: `rotate(${deg}deg)`}} />
                            ))}
                            <div className="mock-radar-point" style={{top: '40%', left: '30%'}} />
                            <div className="mock-radar-point" style={{top: '20%', left: '60%'}} />
                            <div className="mock-radar-point" style={{top: '70%', left: '50%'}} />
                            <div className="mock-radar-point" style={{top: '50%', left: '80%'}} />
                            <p style={{position: 'absolute', bottom: '10px', fontSize: '0.75rem', color: '#94a3b8'}}>Live tracking of 32 core competencies</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <h3>Recent Activity</h3>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7.5 20 7.5"/></svg>
                                </div>
                                <div className="activity-info">
                                    <h4>Senior Frontend Dev Report</h4>
                                    <p>2 hours ago • 84% Match</p>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                                </div>
                                <div className="activity-info">
                                    <h4>Mock Session: React Hooks</h4>
                                    <p>Yesterday • 12m Duration</p>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </div>
                                <div className="activity-info">
                                    <h4>Pricing Plan Explored</h4>
                                    <p>April 22, 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
