import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
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
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            ☀️ Solar Panel Efficiency Optimizer
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            marginBottom: '40px',
            opacity: 0.95,
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
                    🔑 Sign In
                  </button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
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
        background: 'white',
        color: '#2c3e50',
        padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '60px',
            color: '#2c3e50'
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
              link="/ml-metrics"
              linkText="View ML Model"
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
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '80px 20px',
        color: '#2c3e50'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '60px'
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
          Ready to Optimize Your Solar Investment?
        </h2>
        <p style={{ fontSize: '1.3rem', marginBottom: '40px', opacity: 0.9 }}>
          Join thousands of users maximizing their solar efficiency
        </p>
        <Link to={user ? "/analyze" : "/register"} style={{ textDecoration: 'none' }}>
          <button style={{ 
            padding: '20px 50px', 
            fontSize: '1.4rem',
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
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
          }}>
            {user ? '🚀 Start Analysis Now' : '🎉 Get Started Free'}
          </button>
        </Link>
      </div>

      {/* Footer */}
      <div style={{
        background: '#2c3e50',
        color: 'white',
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, opacity: 0.8 }}>
          © 2024 Solar Panel Efficiency Optimizer. Empowering renewable energy decisions with AI.
        </p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, link, linkText }) => {
  const cardContent = (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
      textAlign: 'center',
      transition: 'all 0.3s',
      cursor: 'pointer',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-10px)';
      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{icon}</div>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', color: '#2c3e50' }}>
        {title}
      </h3>
      <p style={{ color: '#7f8c8d', lineHeight: '1.6', fontSize: '1rem', flex: 1 }}>
        {description}
      </p>
      {link && linkText && (
        <Link to={link} style={{ 
          marginTop: '15px',
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    background: 'white',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    transition: 'all 0.3s'
  }}
  onMouseEnter={e => {
    e.currentTarget.style.transform = 'translateX(10px)';
    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = 'translateX(0)';
    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
  }}>
    <div style={{
      minWidth: '60px',
      height: '60px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.8rem',
      fontWeight: 'bold',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
    }}>
      {number}
    </div>
    <div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#2c3e50' }}>
        {title}
      </h3>
      <p style={{ color: '#7f8c8d', lineHeight: '1.6', fontSize: '1.05rem', margin: 0 }}>
        {description}
      </p>
    </div>
  </div>
);

export default Home;
