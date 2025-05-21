import { useGameContext } from '../../context/GameContext';
import { THEME_COLORS } from '../../constants/theme';

const About = ({ onClose }) => {
  const { settings } = useGameContext();
  const theme = settings?.theme || 'dark';
  const colors = theme === 'dark' ? THEME_COLORS.dark : THEME_COLORS.light;

  return (
    <div style={{
      padding: '30px',
      backgroundColor: colors.surface,
      color: colors.text,
      borderRadius: '15px',
      maxWidth: '700px',
      margin: '0 auto',
      boxShadow: `0 0 20px ${colors.border}`,
    }}>
      <h2 style={{ 
        color: colors.primary,
        marginBottom: '20px',
        fontSize: '2rem',
        textAlign: 'center'
      }}>
        About Type Ship
      </h2>
      
      <div style={{ marginBottom: '30px', lineHeight: '1.6' }}>
        <p>
          Type Ship is an innovative typing game designed to enhance your typing speed
          and accuracy while enjoying an immersive space-themed experience. Navigate
          through words appearing in multiple lanes, testing your typing skills against
          time.
        </p>
        <br/>
       
        
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: colors.primary, marginBottom: '10px' }}>Features</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {[
            'Multi-lane word targeting system',
            'Real-time WPM tracking',
            'Customizable themes',
            'Global leaderboard'
          ].map(feature => (
            <li key={feature} style={{
              padding: '8px 0',
              borderBottom: `1px solid ${colors.border}`
            }}>
              ⭐ {feature}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ marginBottom: '15px' }}>
          Created by Ata Tunç Bilge
        </p>
        <a 
          href="https://github.com/AtaTuncBilge"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: colors.primary,
            textDecoration: 'none',
            padding: '10px 20px',
            border: `1px solid ${colors.primary}`,
            borderRadius: '25px',
            transition: 'all 0.3s ease'
          }}
        >
          Visit GitHub Profile
        </a>
      </div>

      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          color: colors.text,
          fontSize: '24px',
          cursor: 'pointer',
          padding: '5px',
        }}
      >
        ×
      </button>
    </div>
  );
};

export default About;
