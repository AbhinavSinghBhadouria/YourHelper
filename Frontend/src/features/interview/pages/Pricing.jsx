import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/hooks/useAuth';
import '../style/pricing.css';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        badge: null,
        monthlyPrice: 0,
        yearlyPrice: 0,
        description: 'Perfect for exploring what YourHelper can do.',
        cta: 'Get Started Free',
        ctaLink: '/register',
        ctaClass: 'pricing-btn pricing-btn--outline',
        features: [
            { text: '3 Interview Reports / month', included: true },
            { text: 'AI-Generated Technical Questions', included: true },
            { text: 'AI-Generated Behavioral Questions', included: true },
            { text: 'Skill Gap Analysis', included: true },
            { text: '7-Day Preparation Roadmap', included: true },
            { text: 'Resume PDF Upload', included: true },
            { text: 'AI Mock Interview (Voice)', included: false },
            { text: 'Tailored Resume PDF Download', included: false },
            { text: 'Unlimited Reports', included: false },
            { text: 'Priority AI (Faster Generation)', included: false },
            { text: 'Interview History & Analytics', included: false },
            { text: 'Team Seats & Collaboration', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        badge: 'Most Popular',
        monthlyPrice: 12,
        yearlyPrice: 9,
        description: 'For serious candidates who want every edge.',
        cta: 'Start 7-Day Free Trial',
        ctaLink: '/register',
        ctaClass: 'pricing-btn pricing-btn--primary',
        features: [
            { text: 'Unlimited Interview Reports', included: true },
            { text: 'AI-Generated Technical Questions', included: true },
            { text: 'AI-Generated Behavioral Questions', included: true },
            { text: 'Advanced Skill Gap Analysis', included: true },
            { text: '30-Day Custom Preparation Roadmap', included: true },
            { text: 'Resume PDF Upload', included: true },
            { text: 'AI Mock Interview (Voice)', included: true },
            { text: 'Tailored Resume PDF Download', included: true },
            { text: 'Priority AI (2× Faster Generation)', included: true },
            { text: 'Interview History & Performance Analytics', included: true },
            { text: 'Company-Specific Question Packs', included: true },
            { text: 'Team Seats & Collaboration', included: false },
        ],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        badge: null,
        monthlyPrice: null,
        yearlyPrice: null,
        description: 'Custom plans for teams, bootcamps, and universities.',
        cta: 'Contact Sales',
        ctaLink: 'mailto:sales@yourhelper.ai',
        ctaClass: 'pricing-btn pricing-btn--outline',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Unlimited Team Seats', included: true },
            { text: 'Centralized Team Dashboard', included: true },
            { text: 'Bulk Resume Analysis', included: true },
            { text: 'Custom AI Persona & Branding', included: true },
            { text: 'API Access for Integrations', included: true },
            { text: 'SSO / SAML Authentication', included: true },
            { text: 'Dedicated Account Manager', included: true },
            { text: 'SLA Uptime Guarantee', included: true },
            { text: 'Custom Data Retention Policy', included: true },
            { text: 'Slack / Teams Bot Integration', included: true },
            { text: 'Priority Support (< 4h response)', included: true },
        ],
    },
];

const FAQ = [
    {
        q: 'Can I cancel anytime?',
        a: 'Yes. Pro plans are billed monthly or yearly and can be cancelled at any time. You keep access until the end of your billing period.',
    },
    {
        q: 'What happens when I hit the 3 report limit on Free?',
        a: "Your existing reports remain accessible. You just can't generate new ones until the next calendar month or until you upgrade to Pro.",
    },
    {
        q: 'Is the AI Mock Interview feature real-time?',
        a: 'Yes — on the Pro plan, you can start a voice-based mock session. The AI will ask questions from your generated report and evaluate your spoken answers in real time.',
    },
    {
        q: 'Does the Resume PDF use my actual uploaded resume?',
        a: 'The Tailored Resume PDF is AI-generated from your profile + job description — optimized for ATS. It uses your uploaded resume as input context, not a verbatim copy.',
    },
    {
        q: 'Do you offer discounts for students?',
        a: 'Yes! Students with a valid .edu email get 50% off the Pro plan. Contact us at hello@yourhelper.ai.',
    },
];

const CheckIcon = () => (
    <svg className="feat-icon feat-icon--check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const CrossIcon = () => (
    <svg className="feat-icon feat-icon--cross" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const Pricing = () => {
    const [yearly, setYearly] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [upgrading, setUpgrading] = useState(false);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleUpgrade = async (planId) => {
        if (!user) {
            window.location.href = "/register";
            return;
        }
        if (planId !== 'pro') return;
        
        setUpgrading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/upgrade`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Welcome to Pro! 🚀");
                setUser(data.user);
                setTimeout(() => navigate("/dashboard"), 1500);
            } else {
                toast.error(data.message || "Upgrade failed");
            }
        } catch (err) {
            console.error("Upgrade error:", err);
            toast.error("Failed to process upgrade.");
        } finally {
            setUpgrading(false);
        }
    };

    return (
        <div className="pricing-page">

            {/* ── Header ── */}
            <header className="pricing-header">
                <Link to="/" className="pricing-logo">YourHelper</Link>
                <nav className="pricing-header-nav">
                    <Link to="/blog" className="ph-nav-link">Blog</Link>
                    <Link to="/login" className="ph-nav-link">Login</Link>
                    <Link to="/register" className="ph-nav-cta">Get Started</Link>
                </nav>
            </header>

            {/* ── Hero ── */}
            <section className="pricing-hero">
                <div className="pricing-hero__badge">TRANSPARENT PRICING</div>
                <h1>Invest in Your Career,<br /><span className="ph-accent">Not in Guesswork.</span></h1>
                <p>One powerful platform. Pick the plan that matches where you are in your journey.</p>

                {/* Toggle */}
                <div className="billing-toggle">
                    <span className={!yearly ? 'toggle-label toggle-label--active' : 'toggle-label'}>Monthly</span>
                    <button
                        className={`toggle-switch ${yearly ? 'toggle-switch--on' : ''}`}
                        onClick={() => setYearly(y => !y)}
                        aria-label="Toggle yearly billing"
                    >
                        <span className="toggle-knob" />
                    </button>
                    <span className={yearly ? 'toggle-label toggle-label--active' : 'toggle-label'}>
                        Yearly <span className="savings-badge">Save 25%</span>
                    </span>
                </div>
            </section>

            {/* ── Plans Grid ── */}
            <section className="plans-grid">
                {PLANS.map(plan => (
                    <div key={plan.id} className={`plan-card ${plan.id === 'pro' ? 'plan-card--featured' : ''}`}>
                        {plan.badge && <div className="plan-badge">{plan.badge}</div>}

                        <div className="plan-card__top">
                            <h2 className="plan-name">{plan.name}</h2>
                            <p className="plan-desc">{plan.description}</p>

                            <div className="plan-price">
                                {plan.monthlyPrice !== null ? (
                                    <>
                                        <span className="price-currency">$</span>
                                        <span className="price-value">
                                            {yearly ? plan.yearlyPrice : plan.monthlyPrice}
                                        </span>
                                        <span className="price-period">/ mo</span>
                                        {yearly && plan.yearlyPrice > 0 && (
                                            <span className="price-billed">billed annually</span>
                                        )}
                                    </>
                                ) : (
                                    <span className="price-custom">Custom</span>
                                )}
                            </div>

                            <button 
                                onClick={() => handleUpgrade(plan.id)} 
                                disabled={upgrading || user?.plan === plan.id}
                                className={plan.ctaClass}
                            >
                                {user?.plan === plan.id ? 'Current Plan' : upgrading && plan.id === 'pro' ? 'Upgrading...' : plan.cta}
                            </button>
                        </div>

                        <div className="plan-divider" />

                        <ul className="plan-features">
                            {plan.features.map((feat, i) => (
                                <li key={i} className={`plan-feature ${feat.included ? '' : 'plan-feature--disabled'}`}>
                                    {feat.included ? <CheckIcon /> : <CrossIcon />}
                                    {feat.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>

            {/* ── Premium Features Callout ── */}
            <section className="premium-callout">
                <div className="pc-inner">
                    <div className="pc-label">PRO EXCLUSIVE</div>
                    <h2>What you unlock with Pro</h2>
                    <div className="pc-features-grid">

                        <div className="pc-feat">
                            <div className="pc-feat__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12z"/><path d="M12 12V2a10 10 0 0 1 10 10"/><circle cx="12" cy="12" r="3"/></svg>
                            </div>
                            <h3>AI Mock Interview (Voice)</h3>
                            <p>Real-time voice interviews with instant AI feedback on pace, confidence, and answer quality.</p>
                        </div>

                        <div className="pc-feat">
                            <div className="pc-feat__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                            </div>
                            <h3>Tailored Resume PDF</h3>
                            <p>AI rewrites your resume for the exact job description, keyword-optimized and ATS-ready — downloadable as PDF.</p>
                        </div>

                        <div className="pc-feat">
                            <div className="pc-feat__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                            </div>
                            <h3>Performance Analytics</h3>
                            <p>Track your match scores, skill gaps, and improvement over time across all your interview plans.</p>
                        </div>

                        <div className="pc-feat">
                            <div className="pc-feat__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                            </div>
                            <h3>Company-Specific Packs</h3>
                            <p>Access curated question banks for Google, Amazon, Meta, Microsoft, and 50+ top companies.</p>
                        </div>

                        <div className="pc-feat">
                            <div className="pc-feat__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                            <h3>Priority AI Generation</h3>
                            <p>Skip the queue. Pro users get dedicated AI capacity — reports generate 2× faster, even during peak hours.</p>
                        </div>

                        <div className="pc-feat">
                            <div className="pc-feat__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            </div>
                            <h3>Unlimited Reports</h3>
                            <p>No monthly caps. Generate as many interview strategies as you need across all your target roles.</p>
                        </div>

                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="pricing-faq">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-list">
                    {FAQ.map((item, i) => (
                        <div key={i} className={`faq-item ${openFaq === i ? 'faq-item--open' : ''}`}>
                            <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                {item.q}
                                <svg className="faq-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            {openFaq === i && <p className="faq-answer">{item.a}</p>}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="pricing-cta-banner">
                <h2>Ready to ace your next interview?</h2>
                <p>Join 20,000+ professionals who use YourHelper to land their dream roles.</p>
                <div className="pcb-actions">
                    <Link to="/register" className="pricing-btn pricing-btn--primary">Start Free — No Card Required</Link>
                    <Link to="/login" className="pricing-btn pricing-btn--ghost">Already have an account?</Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="pricing-footer">
                <div className="pricing-logo">YourHelper</div>
                <p>© 2024 YourHelper • Powered by Gemini AI</p>
            </footer>

        </div>
    );
};

export default Pricing;
