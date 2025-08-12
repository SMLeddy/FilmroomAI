import React from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import styles from './_index.module.css';
import { Helmet } from 'react-helmet';

const features = [
  {
    icon: Target,
    title: 'Multi-Game Opponent Analysis',
    description: 'Track opponents across their entire season. Analyze tendencies, formations, and play calls from every game to build comprehensive scouting reports.',
  },
  {
    icon: TrendingUp,
    title: 'Situational Tendencies',
    description: 'Know what your opponent runs on 3rd and long, in the red zone, or when trailing. Get actionable insights for every down and distance.',
  },
  {
    icon: Zap,
    title: 'Cross-Team Pattern Recognition',
    description: 'See how opponents perform against similar teams. Identify their strengths, weaknesses, and adjustments across different matchups.',
  },
  {
    icon: Users,
    title: 'Game Plan Development',
    description: 'Build detailed opponent profiles and share comprehensive scouting reports with your entire coaching staff for coordinated game planning.',
  },
];

const IndexPage = () => {
  return (
    <>
      <Helmet>
        <title>Film.AI - Comprehensive Opponent Scouting & Analysis</title>
        <meta name="description" content="Transform your game preparation with comprehensive opponent scouting. Analyze tendencies across multiple games, track situational patterns, and build winning game plans." />
      </Helmet>
      <div className={styles.pageContainer}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroHeadline}>
              Know your opponent better
              <br />
              <span className={styles.heroHighlight}>than they know themselves.</span>
            </h1>
            <p className={styles.heroSubheadline}>
              Comprehensive opponent scouting powered by AI. Analyze multi-game tendencies, situational patterns, and build winning game plans with unprecedented insight.
            </p>
            <div className={styles.heroActions}>
              <Button asChild size="lg">
                <Link to="/dashboard">Scout an Opponent</Link>
              </Button>
              <Button variant="outline" size="lg">
                Request Access
              </Button>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <img
              src="https://images.unsplash.com/photo-1580237754524-f26ed36fa85c?q=80&w=2071"
              alt="Football strategy"
              className={styles.heroImage}
            />
            <div className={styles.heroImageOverlay}></div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <feature.icon className={styles.featureIcon} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default IndexPage;