// src/Pages/LetterWriting.jsx
import { useState, useEffect } from 'react';
import { subscribeToLetters, addLetter } from '../services/firebaseService';
import './LetterWriting.css';

const LetterWriting = () => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // 실시간 편지 구독
  useEffect(() => {
    const unsubscribe = subscribeToLetters((lettersData) => {
      setLetters(lettersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 토스트 알림 표시 함수
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // 편지 작성 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 내용이 비어있으면 제출 불가
    if (!content.trim()) {
      showToast('편지 내용을 입력해주세요.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      await addLetter(author.trim() || '익명', content.trim());

      // 폼 초기화
      setAuthor('');
      setContent('');

      showToast('편지가 성공적으로 작성되었습니다! ✉️', 'success');
    } catch (error) {
      console.error('편지 작성 실패:', error);
      showToast('편지 작성에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (date) => {
    const now = new Date();
    const letterDate = new Date(date);
    const diffMs = now - letterDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return letterDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 포스트잇 색상 배열 (브라운 파스텔톤)
  const postItColors = [
    '#F5EBE0', // 베이지
    '#E3D5CA', // 라이트 브라운
    '#D5BDAF', // 웜 브라운
    '#F9F3EE', // 크림
    '#EAD8C9', // 샌드
    '#F0E5DB', // 아이보리 브라운
    '#E8DDD0', // 밀크 브라운
    '#F2E8DD', // 피치 브라운
  ];

  return (
    <div className="letter-writing-page page-with-decorations">
      {/* Background decorations */}
      <div className="bg-decorations-letter" aria-hidden="true"></div>

      {/* 토스트 알림 */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : '⚠'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="letter-writing-container">
        {/* 편지 작성 폼 */}
        <div className="letter-form-section">
          <h1 className="letter-page-title">✉️ 편지 작성하기</h1>
          <p className="letter-page-subtitle">
            친구들에게 따뜻한 메시지를 남겨보세요
          </p>

          <form onSubmit={handleSubmit} className="letter-form">
            <div className="letter-form-group">
              <label htmlFor="author" className="letter-form-label">
                작성자 (닉네임)
              </label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="익명으로 남기려면 비워두세요"
                className="letter-form-input"
                maxLength={20}
              />
            </div>

            <div className="letter-form-group">
              <label htmlFor="content" className="letter-form-label">
                내용 <span className="letter-form-required">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="따뜻한 메시지를 작성해주세요..."
                className="letter-form-textarea"
                rows={5}
                maxLength={500}
                required
              />
              <div className="letter-form-counter">
                {content.length} / 500
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="letter-form-submit"
            >
              {submitting ? '작성 중...' : '편지 보내기 ✉️'}
            </button>
          </form>
        </div>

        {/* 구분선 */}
        <div className="letter-divider"></div>

        {/* 편지 목록 */}
        <div className="letter-list-section">
          <h2 className="letter-list-title">
            📮 모두의 편지함
            {!loading && <span className="letter-count">({letters.length})</span>}
          </h2>

          {loading ? (
            <div className="letter-loading">
              <div className="letter-loading-spinner"></div>
              <p>편지를 불러오는 중...</p>
            </div>
          ) : letters.length === 0 ? (
            <div className="letter-empty">
              <p className="letter-empty-icon">📭</p>
              <p className="letter-empty-text">아직 작성된 편지가 없습니다.</p>
              <p className="letter-empty-hint">첫 번째 편지를 작성해보세요!</p>
            </div>
          ) : (
            <div className="letter-grid">
              {letters.map((letter, index) => (
                <div
                  key={letter.id}
                  className="letter-card"
                  style={{
                    backgroundColor: postItColors[index % postItColors.length],
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <div className="letter-card-content">
                    {letter.content}
                  </div>
                  <div className="letter-card-footer">
                    <span className="letter-card-author">- {letter.author}</span>
                    <span className="letter-card-date">
                      {formatDate(letter.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LetterWriting;
