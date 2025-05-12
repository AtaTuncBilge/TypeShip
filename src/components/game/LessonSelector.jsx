import React, { useState } from 'react';
import { useGameContext } from 'GameContext';

const LessonSelector = ({ onSelectLesson }) => {
  const { theme } = useGameContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // First batch of lessons (we'll show only a subset initially)
  const lessons = [
    { id: 1, title: "Basic Home Row Keys", difficulty: "Beginner" },
    { id: 2, title: "Common English Words", difficulty: "Beginner" },
    { id: 3, title: "Coding Fundamentals", difficulty: "Intermediate" },
    { id: 4, title: "Famous Quotes", difficulty: "Intermediate" },
    { id: 5, title: "Scientific Terminology", difficulty: "Advanced" },
    { id: 6, title: "Literary Passages", difficulty: "Advanced" },
    { id: 7, title: "Business Communication", difficulty: "Intermediate" },
    { id: 8, title: "Medical Terminology", difficulty: "Expert" },
    { id: 9, title: "Legal Documents", difficulty: "Expert" },
    { id: 10, title: "Programming Languages", difficulty: "Advanced" },
    // More lessons would be dynamically loaded as needed
  ];

  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLessonSelect = (lesson) => {
    onSelectLesson(lesson);
    setIsOpen(false);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      marginBottom: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div 
        onClick={toggleDropdown}
        style={{
          padding: '12px 15px',
          borderRadius: '6px',
          backgroundColor: theme === 'light' ? '#f0f2f5' : '#3a3b3c',
          color: theme === 'light' ? '#333' : '#e4e6eb',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'background-color 0.2s ease'
        }}
      >
        <span style={{ fontWeight: '500' }}>Select Lesson (Total: 939)</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          backgroundColor: theme === 'light' ? '#fff' : '#3a3b3c',
          borderRadius: '6px',
          marginTop: '5px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 100,
          maxHeight: '350px',
          overflowY: 'auto',
          padding: '10px',
          boxSizing: 'border-box'
        }}>
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
              backgroundColor: theme === 'light' ? '#fff' : '#3a3b3c',
              color: theme === 'light' ? '#333' : '#e4e6eb',
              outline: 'none'
            }}
          />
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '8px'
          }}>
            {filteredLessons.map(lesson => (
              <div
                key={lesson.id}
                onClick={() => handleLessonSelect(lesson)}
                style={{
                  padding: '12px',
                  borderRadius: '4px',
                  backgroundColor: theme === 'light' ? '#f8f9fa' : '#444',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  border: `1px solid ${theme === 'light' ? '#eee' : '#555'}`,
                  ":hover": {
                    backgroundColor: theme === 'light' ? '#e9ecef' : '#505050'
                  }
                }}
              >
                <div style={{
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: theme === 'light' ? '#333' : '#e4e6eb',
                }}>
                  {lesson.title}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  backgroundColor: getDifficultyColor(lesson.difficulty, theme),
                  color: 'white',
                }}>
                  {lesson.difficulty}
                </div>
              </div>
            ))}
            
            {filteredLessons.length === 0 && (
              <div style={{
                padding: '15px',
                textAlign: 'center',
                color: theme === 'light' ? '#666' : '#aaa',
                gridColumn: '1 / -1'
              }}>
                No lessons found matching "{searchTerm}"
              </div>
            )}
          </div>
          
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: theme === 'light' ? '#f0f2f5' : '#444',
            borderRadius: '4px',
            fontSize: '0.9rem',
            color: theme === 'light' ? '#666' : '#aaa',
            textAlign: 'center'
          }}>
            Showing {filteredLessons.length} of 939 lessons
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get color based on difficulty
const getDifficultyColor = (difficulty, theme) => {
  switch(difficulty) {
    case 'Beginner':
      return '#4caf50'; // Green
    case 'Intermediate':
      return '#2196f3'; // Blue
    case 'Advanced':
      return '#ff9800'; // Orange
    case 'Expert':
      return '#f44336'; // Red
    default:
      return theme === 'light' ? '#757575' : '#aaa'; // Gray
  }
};

export default LessonSelector;