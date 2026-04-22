import React from 'react';
import { Link } from 'react-router-dom';
import '../style/landing.css';
import '../style/blog.css';

const MOCK_POSTS = [
    {
        id: 1,
        category: "Interview Strategy",
        title: "How to Answer 'Tell Me About Yourself' Like a Pro",
        excerpt: "It's the most common opening question, yet the one candidates stumble on most. Learn the 3-part framework to craft a compelling, concise introduction.",
        author: "Sarah Jenkins",
        date: "Oct 12, 2024"
    },
    {
        id: 2,
        category: "Technical Prep",
        title: "Mastering System Design: The Microservices Dilemma",
        excerpt: "When should you propose a microservices architecture during a system design interview? We break down the tradeoffs interviewers are listening for.",
        author: "David Chen",
        date: "Oct 08, 2024"
    },
    {
        id: 3,
        category: "Career Growth",
        title: "Negotiating Your Offer in a Cooling Tech Market",
        excerpt: "Leverage has shifted, but negotiation isn't dead. Discover data-driven strategies for maximizing your compensation package in 2024.",
        author: "Alex Rivera",
        date: "Sep 29, 2024"
    },
    {
        id: 4,
        category: "Behavioral",
        title: "The STAR Method Upgrade: Adding the 'L' for Learning",
        excerpt: "The traditional STAR method is great, but adding a 'Learning' component at the end of your behavioral answers proves growth and self-awareness.",
        author: "Emily Taylor",
        date: "Sep 15, 2024"
    },
    {
        id: 5,
        category: "Industry Insights",
        title: "Why Match Scores Matter More Than pure LeetCode",
        excerpt: "Companies are shifting away from pure algorithmic puzzle-solving towards practical, role-aligned skill profiles. Here is how you adapt.",
        author: "Marcus Doe",
        date: "Sep 02, 2024"
    }
];

const Blog = () => {
    return (
        <div className="blog-page">
            {/* Reusing the Landing Page Navbar for consistency */}
            <header className="landing-header">
                <Link to="/" className="landing-logo" style={{ textDecoration: 'none' }}>YourHelper</Link>
                
                <nav className="landing-nav-center">
                    <Link to="/features" className="nav-link-btn">Features</Link>
                    <Link to="/pricing" className="nav-link-btn">Pricing</Link>
                    <Link to="/blog" className="nav-link-btn" style={{color: '#111827'}}>Blog</Link>
                </nav>

                <div className="landing-nav-actions">
                    <Link to="/login" className="nav-link-btn">Login</Link>
                    <Link to="/register" className="nav-primary-btn">Get Started</Link>
                </div>
            </header>

            <section className="blog-hero">
                <h1 className="blog-title">Insights for the Modern Candidate</h1>
                <p className="blog-subtitle">Expert advice, interview frameworks, and industry trends to help you land your dream role.</p>
            </section>

            <main className="blog-container">
                {MOCK_POSTS.map(post => (
                    <article key={post.id} className="blog-card">
                        <div className="blog-image-placeholder">
                            {/* In a real app, this would be an <img src="..." /> */}
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                        <div className="blog-content">
                            <span className="blog-category">{post.category}</span>
                            <h2 className="blog-card-title">{post.title}</h2>
                            <p className="blog-card-excerpt">{post.excerpt}</p>
                            <div className="blog-footer">
                                <span className="blog-author">{post.author}</span>
                                <span className="blog-date">{post.date}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </main>
            
            <footer className="landing-footer">
                <div className="landing-logo" style={{fontSize: '1.2rem'}}>YourHelper</div>
                <div className="footer-copy">© 2024 YOURHELPER. ARCHITECTING THE FUTURE OF INTERVIEWS.</div>
            </footer>
        </div>
    );
};

export default Blog;
