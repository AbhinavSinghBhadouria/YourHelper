import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/landing.css';

const LandingPage = () => {
    const [jobDesc, setJobDesc] = useState('');
    const [keywords, setKeywords] = useState([]);

    const extractKeywords = () => {
        if (!jobDesc) return;
        const text = jobDesc.replace(/[.,:;()]/g, '');
        const words = text.split(/\s+/);
        
        const ignoreList = ['the', 'and', 'or', 'a', 'to', 'of', 'in', 'for', 'with', 'on', 'is', 'at', 'as', 'by', 'an', 'be', 'this', 'we', 'you', 'are'];
        const potentialKeywords = words.filter(word => 
            word.length > 3 && !ignoreList.includes(word.toLowerCase())
        );

        const unique = [...new Set(potentialKeywords)].slice(0, 5);
        setKeywords(unique);
    };

    return (
        <div className="landing-page">
            <header className="landing-header">
                <Link to="/" className="landing-logo" style={{ textDecoration: 'none' }}>YourHelper</Link>
                
                <nav className="landing-nav-center">
                    <Link to="/features" className="nav-link-btn">Features</Link>
                    <Link to="/pricing" className="nav-link-btn">Pricing</Link>
                    <Link to="/blog" className="nav-link-btn">Blog</Link>
                </nav>

                <div className="landing-nav-actions">
                    <Link to="/login" className="nav-link-btn">Login</Link>
                    <Link to="/register" className="nav-primary-btn">Get Started</Link>
                </div>
            </header>

            {/* Split Hero Section */}
            <section className="hero-wrapper">
                <div className="hero-grid">
                    <div className="hero-left">
                        <div className="hero-badge-green">NEW AI INTERVIEW INTELLIGENCE</div>
                        <h1 className="hero-title-new">Master Your Next Interview with <span>Precision.</span></h1>
                        <p className="hero-subtitle-new">
                            YourHelper uses advanced AI to analyze job descriptions, predict technical questions, and provide real-time feedback on your mock responses. Transform your preparation into a winning performance.
                        </p>

                        <div className="hero-action-row">
                            <Link to="/register" className="btn-solid-green">Start Practicing Now</Link>
                            <a href="#demo" className="btn-demo">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                                Watch Demo
                            </a>
                        </div>

                        <div className="avatar-group-container">
                            <div className="avatar-group">
                                <div className="avatar" style={{backgroundImage: 'url(https://i.pravatar.cc/100?img=1)', backgroundSize: 'cover'}}></div>
                                <div className="avatar" style={{backgroundImage: 'url(https://i.pravatar.cc/100?img=2)', backgroundSize: 'cover'}}></div>
                                <div className="avatar" style={{backgroundImage: 'url(https://i.pravatar.cc/100?img=3)', backgroundSize: 'cover'}}></div>
                            </div>
                            <span className="avatar-text">Joined by 20,000+ ambitious professionals today.</span>
                        </div>
                    </div>

                    <div className="hero-right">
                        <img src="/hero-interview.png" alt="Candidate in Interview" className="hero-image-mock" />
                        <div className="hero-float-ui">
                            <div className="ui-bar short"></div>
                            <div className="ui-bar long"></div>
                            <div className="ui-bar long"></div>
                            <div className="ui-bar green-accent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features Section */}
            <section className="bento-section">
                <div className="bento-header-wrapper">
                    <div className="bento-heading">
                        <h2>Designed for the High-Stakes Career.</h2>
                        <p>We've eliminated the guesswork from interview prep. Our platform focuses on the metrics that actually matter to recruiters.</p>
                    </div>
                    <Link to="/features" className="bento-explore-link">
                        Explore all features 
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </Link>
                </div>

                <div className="bento-grid">
                    {/* Top Left */}
                    <div className="bento-card bento-large">
                        <div className="bento-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <h3>Sentiment & Confidence AI</h3>
                        <p>Our algorithms analyze your vocal tone and facial expressions to ensure you're projecting the exact balance of authority and approachability.</p>
                        
                        <div className="bento-tag-group">
                            <span className="bento-tag">Tone Analysis</span>
                            <span className="bento-tag">Eye Contact Tracking</span>
                            <span className="bento-tag">Pace Recognition</span>
                        </div>
                    </div>

                    {/* Right Tall */}
                    <div className="bento-card bento-tall">
                        <div className="bento-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        </div>
                        <h3>Competency Mapping</h3>
                        <p>Automatically align your past experiences to the core competencies listed in any job description.</p>
                        
                        <div className="bento-chart-mock">
                            <div className="ui-bar short"></div>
                            <div className="chart-bar-container">
                                <div className="chart-bar" style={{height: '40%'}}></div>
                                <div className="chart-bar" style={{height: '60%'}}></div>
                                <div className="chart-bar active" style={{height: '85%'}}></div>
                                <div className="chart-bar" style={{height: '30%'}}></div>
                                <div className="chart-bar active" style={{height: '95%'}}></div>
                                <div className="chart-bar" style={{height: '50%'}}></div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Left */}
                    <div className="bento-card bento-small">
                        <div className="bento-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <h3>Resume Tailoring</h3>
                        <p>We format your raw achievements to maximize your resume score through high-converting ATS parsers.</p>
                    </div>

                    {/* Bottom Right Wide */}
                    <div className="bento-card bento-wide-dark">
                        <div className="abstract-wave-bg"></div>
                        <h3>Real-time Copilot</h3>
                        <p>Receive live semantic hints and bullet talking points during actual interview sessions to keep your narrative on track.</p>
                        <div>
                            <Link to="/register" className="btn-solid-green" style={{padding: '0.6rem 1.2rem', fontSize: '0.9rem'}}>See how it works</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Keyword Extractor UI Redesign */}
            <section className="public-feature">
                <h2>Try it out: Free Keyword Extractor</h2>
                <p>Paste a job description below, and let our AI extract the high-priority keywords you should be hitting.</p>
                
                <div className="extractor-card">
                    <textarea 
                        className="extractor-textarea"
                        placeholder="Paste job description text here..."
                        value={jobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                    ></textarea>

                    <div className="extractor-card-bottom">
                        <div className="status-indicator">
                            <div className="status-dot"></div>
                            Ready Process. Enter text to start.
                        </div>
                        <button className="extractor-btn" onClick={extractKeywords}>
                            Extract Keywords
                        </button>
                    </div>
                </div>

                <div className="common-labels-section">
                    <div className="common-labels-title">COMMON EXTRACTED LABELS</div>
                    <div className="keyword-tags">
                        {keywords.length > 0 ? (
                            keywords.map((kw, i) => <span key={i} className="keyword-tag">{kw}</span>)
                        ) : (
                            <>
                                <span className="keyword-tag">Strategic Leadership</span>
                                <span className="keyword-tag">Cross-functional Collaboration</span>
                                <span className="keyword-tag">P&L Accountability</span>
                                <span className="keyword-tag">Stakeholder Management</span>
                                <span className="keyword-tag">Agile Methodology</span>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Dummy Client Logos */}
            <section className="client-logos">
                <div className="dummy-logo"></div>
                <div className="dummy-logo"></div>
                <div className="dummy-logo"></div>
                <div className="dummy-logo"></div>
                <div className="dummy-logo"></div>
            </section>

            {/* Clean Footer */}
            <footer className="landing-footer">
                <div className="landing-logo" style={{fontSize: '1.2rem'}}>YourHelper</div>
                <div className="footer-links">
                    <Link to="#" className="footer-link">Privacy Policy</Link>
                    <Link to="#" className="footer-link">Terms of Service</Link>
                    <Link to="#" className="footer-link">Cookie Policy</Link>
                </div>
                <div className="footer-socials">
                    <div className="social-icon"></div>
                    <div className="social-icon"></div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
