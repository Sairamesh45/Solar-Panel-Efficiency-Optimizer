import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b0620 0%, #1a0f2f 50%, #2f1242 100%)',
      color: '#E9E6FF'
    }}>
      <Navbar />
      {/* Hero Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '100px 20px 80px',
        textAlign: 'center'
      }}>
        <div className="fadeIn">
          <h1 style={{ 
            fontSize: '4rem', 
            marginBottom: '20px',
            fontWeight: '800',
            textShadow: '2px 2px 8px rgba(139, 92, 246, 0.3)',
            color: '#E9E6FF'
          }}>
            ☀️ Solar Panel Efficiency Optimizer
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            marginBottom: '40px',
            color: '#BFB4E6',
            maxWidth: '800px',
            margin: '0 auto 40px',
            lineHeight: '1.8'
          }}>
            Advanced AI-driven analytics for maximizing solar panel efficiency, 
            predicting maintenance needs, and optimizing your renewable energy investment.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <Link to="/analyze" style={{ textDecoration: 'none' }}>
                  <button style={{ 
                    padding: '18px 40px', 
                    fontSize: '1.3rem',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
                  }}>
                    🚀 Start New Analysis
                  </button>
                </Link>
                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                  <button style={{ 
                    padding: '18px 40px', 
                    fontSize: '1.3rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '2px solid white',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    📊 View Dashboard
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button style={{ 
                    padding: '18px 40px', 
                    fontSize: '1.3rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #c08cff 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(139, 92, 246, 0.6)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
                  }}>
                    🔑 Sign In
                  </button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button style={{ 
                    padding: '18px 40px', 
                    fontSize: '1.3rem',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    color: '#E9E6FF',
                    border: '2px solid #8b5cf6',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    📝 Get Started Free
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        background: 'rgba(11, 6, 32, 0.5)',
        padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '60px',
            color: '#E9E6FF'
          }}>
            🌟 Why Choose Our Platform?
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px'
          }}>
            <FeatureCard 
              icon="🤖"
              title="AI-Powered Analysis"
              description="Advanced machine learning algorithms analyze your solar system's performance and predict optimal configurations."
            />
            <FeatureCard 
              icon="💰"
              title="Financial Insights"
              description="Get accurate ROI calculations, payback periods, and long-term savings projections for informed decisions."
            />
            <FeatureCard 
              icon="🔧"
              title="Predictive Maintenance"
              description="Stay ahead of issues with intelligent maintenance alerts and recommended actions based on system health."
            />
            <FeatureCard 
              icon="📈"
              title="Performance Tracking"
              description="Monitor efficiency losses, system health scores, and identify optimization opportunities."
            />
            <FeatureCard 
              icon="🗺️"
              title="Location-Based Optimization"
              description="Customized recommendations considering your specific geographic location, climate, and solar irradiance."
            />
            <FeatureCard 
              icon="📊"
              title="Detailed Reports"
              description="Comprehensive analysis reports with visualizations, breakdowns, and actionable insights."
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{
        background: 'rgba(26, 15, 47, 0.5)',
        padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '60px',
            color: '#E9E6FF'
          }}>
            🎯 How It Works
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <StepCard 
              number="1"
              title="Enter Your Details"
              description="Provide information about your location, roof specifications, current solar setup, and energy consumption."
            />
            <StepCard 
              number="2"
              title="AI Analysis"
              description="Our advanced ML model processes your data, considering weather patterns, shading, and optimal configurations."
            />
            <StepCard 
              number="3"
              title="Get Recommendations"
              description="Receive personalized insights including system sizing, efficiency analysis, financial projections, and maintenance alerts."
            />
            <StepCard 
              number="4"
              title="Track & Optimize"
              description="Monitor your analysis history, compare results over time, and implement recommended improvements."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'rgba(11, 6, 32, 0.5)',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#E9E6FF' }}>
          Ready to Optimize Your Solar Investment?
        </h2>
        <p style={{ fontSize: '1.3rem', marginBottom: '40px', color: '#BFB4E6' }}>
          Join thousands of users maximizing their solar efficiency
        </p>
        <Link to={user ? "/analyze" : "/register"} style={{ textDecoration: 'none' }}>
          <button style={{ 
            padding: '20px 50px', 
            fontSize: '1.4rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #c08cff 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(139, 92, 246, 0.6)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
          }}>
            {user ? '🚀 Start Analysis Now' : '🎉 Get Started Free'}
          </button>
        </Link>
      </div>

      {/* Footer */}
      <div style={{
        background: 'rgba(11, 6, 32, 0.8)',
        borderTop: '1px solid rgba(139, 92, 246, 0.2)',
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#9D8FCC' }}>
          © 2024 Solar Panel Efficiency Optimizer. Empowering renewable energy decisions with AI.
        </p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, link, linkText }) => {
  const cardContent = (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)',
      textAlign: 'center',
      transition: 'all 0.3s',
      cursor: 'pointer',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-10px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.3)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.1)';
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{icon}</div>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', color: '#E9E6FF', fontWeight: '600' }}>
        {title}
      </h3>
      <p style={{ color: '#BFB4E6', lineHeight: '1.6', fontSize: '1rem', flex: 1 }}>
        {description}
      </p>
      {link && linkText && (
        <Link to={link} style={{ 
          marginTop: '15px',
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #c08cff 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '25px',
          display: 'inline-block',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          transition: 'all 0.2s'
        }}>
          {linkText} →
        </Link>
      )}
    </div>
  );
  
  return cardContent;
};

const StepCard = ({ number, title, description }) => (
  <div style={{
    display: 'flex',
    gap: '25px',
    alignItems: 'start',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)',
    transition: 'all 0.3s'
  }}
  onMouseEnter={e => {
    e.currentTarget.style.transform = 'translateX(10px)';
    e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.3)';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = 'translateX(0)';
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.1)';
  }}>
    <div style={{
      minWidth: '60px',
      height: '60px',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #c08cff 100%)',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.8rem',
      fontWeight: 'bold',
      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
    }}>
      {number}
    </div>
    <div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#E9E6FF', fontWeight: '600' }}>
        {title}
      </h3>
      <p style={{ color: '#BFB4E6', lineHeight: '1.6', fontSize: '1.05rem', margin: 0 }}>
        {description}
      </p>
    </div>
  </div>
);

export default Home;
