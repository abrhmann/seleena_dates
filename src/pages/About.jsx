import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, ShieldCheck, Palmtree, Droplets } from 'lucide-react';
import './About.css';

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="container">
                    <div className="about-hero-content animate-fade-in">
                        <span className="subtitle">{t('ourStory')}</span>
                        <h1>From the Heart of <span className="text-gold">Bahria Oasis</span></h1>
                        <p>
                            Nestled in the Western Desert of Egypt, the Bahria Oasis is a place where time stands still,
                            and the ancient tradition of date cultivation thrives in mineral-rich volcanic soil.
                        </p>
                    </div>
                </div>
            </section>

            <section className="about-section">
                <div className="container">
                    <div className="story-grid">
                        <div className="story-image">
                            <img src="https://images.unsplash.com/photo-1547127796-06bb04e4b315?auto=format&fit=crop&q=80&w=800" alt="Bahria Oasis Landscape" />
                            <div className="experience-badge">
                                <strong>25+</strong>
                                <span>Years of Heritage</span>
                            </div>
                        </div>
                        <div className="story-content">
                            <h2>The Seleena Heritage</h2>
                            <p>
                                At Seleena Dates, we don't just sell fruit; we share a legacy. Our journey began generations ago
                                among the palm groves of Bahria, where the unique combination of intense sun and alkaline
                                volcanic water produces the world's most exquisite Majdool dates.
                            </p>
                            <p>
                                Every date is hand-picked at the peak of ripeness, sun-dried naturally, and packed with care
                                to ensure the "honey-like" texture and rich caramel flavor reach you exactly as nature intended.
                            </p>

                            <div className="values-grid">
                                <div className="value-item">
                                    <Palmtree className="text-gold" size={32} />
                                    <h4>Organic Growth</h4>
                                    <p>No pesticides or chemicals. Just sun, water, and soil.</p>
                                </div>
                                <div className="value-item">
                                    <ShieldCheck className="text-gold" size={32} />
                                    <h4>Premium Quality</h4>
                                    <p>Only the top 5% of the harvest makes it into our boxes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="philosophy section">
                <div className="container text-center">
                    <div className="section-header">
                        <h2>Our Core Philosophy</h2>
                        <p>Driven by nature, sustained by tradition.</p>
                    </div>

                    <div className="philosophy-grid">
                        <div className="phi-card">
                            <div className="phi-icon"><Heart fill="var(--color-gold)" color="var(--color-gold)" /></div>
                            <h3>Passion</h3>
                            <p>We are dedicated to preserving the ancient methods of date farming that have existed for millennia.</p>
                        </div>
                        <div className="phi-card">
                            <div className="phi-icon"><Droplets color="var(--color-gold)" /></div>
                            <h3>Purity</h3>
                            <p>From our volcanic aquifers to your table, we maintain the highest standards of natural purity.</p>
                        </div>
                        <div className="phi-card">
                            <div className="phi-icon"><ShieldCheck color="var(--color-gold)" /></div>
                            <h3>Sustainability</h3>
                            <p>We support local Bahria farmers and use eco-friendly practices to protect our oasis home.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
