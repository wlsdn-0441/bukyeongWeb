// src/components/widgets/LetterWidget.jsx
import { memo, useEffect, useState } from 'react';
import { subscribeToLetters } from '../../services/firebaseService';
import './LetterWidget.css';

const LetterWidget = memo(() => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToLetters((lettersData) => {
      setLetters(lettersData.slice(0, 3)); // 최근 3개만 표시
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="letter-widget">
        <div className="letter-widget-loading">편지를 불러오는 중...</div>
      </div>
    );
  }

  if (letters.length === 0) {
    return (
      <div className="letter-widget">
        <div className="letter-widget-empty">
          <p>✉️</p>
          <p>아직 작성된 편지가 없습니다.</p>
          <p className="letter-widget-empty-hint">첫 번째 편지를 작성해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="letter-widget">
      <div className="letter-widget-list">
        {letters.map((letter) => (
          <div key={letter.id} className="letter-widget-item">
            <div className="letter-widget-content">
              {letter.content.length > 50
                ? `${letter.content.substring(0, 50)}...`
                : letter.content}
            </div>
            <div className="letter-widget-author">- {letter.author}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

LetterWidget.displayName = 'LetterWidget';

export default LetterWidget;
