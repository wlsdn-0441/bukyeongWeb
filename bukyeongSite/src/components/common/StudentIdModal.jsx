/**
 * 학번 입력 모달 컴포넌트
 *
 * 온보딩 완료 후 표시되며, 4자리 학번을 입력받아 저장합니다.
 */

import { useState, useEffect } from 'react';
import { registerStudentId } from '../../services/studentService';
import { formatStudentIdInput, parseStudentId } from '../../utils/studentIdParser';
import './StudentIdModal.css';

export default function StudentIdModal({ show, onComplete }) {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  // 모달 표시 시 body에 클래스 추가하여 네비게이션 숨김
  useEffect(() => {
    if (show) {
      document.body.classList.add('student-id-modal-active');
      console.log('[StudentIdModal] 네비게이션 숨김 - body.student-id-modal-active 추가');
    } else {
      document.body.classList.remove('student-id-modal-active');
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.classList.remove('student-id-modal-active');
    };
  }, [show]);

  // 실시간 미리보기 (학번 입력 시 즉시 표시)
  useEffect(() => {
    if (studentId.length === 4) {
      const parsed = parseStudentId(studentId);
      if (parsed.isValid) {
        setPreview(parsed.formatted);
        setError('');
        console.log('[StudentIdModal] 유효한 학번:', parsed.formatted);
      } else {
        setPreview(null);
        setError(parsed.error);
        console.log('[StudentIdModal] 유효하지 않은 학번:', parsed.error);
      }
    } else {
      setPreview(null);
      setError('');
    }
  }, [studentId]);

  // 입력값 포맷팅 (숫자만 허용, 4자리 제한)
  const handleInputChange = (e) => {
    const formatted = formatStudentIdInput(e.target.value);
    setStudentId(formatted);
  };

  // 학번 등록 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsed = parseStudentId(studentId);
    if (!parsed.isValid) {
      setError(parsed.error);
      return;
    }

    setIsSubmitting(true);
    console.log('[StudentIdModal] 학번 등록 시도:', studentId);

    try {
      await registerStudentId(studentId);
      console.log('[StudentIdModal] 학번 등록 성공');

      // 완료 콜백 호출
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('[StudentIdModal] 학번 등록 실패:', err);
      setError(err.message || '학번 등록에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  // 키보드 Enter 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && studentId.length === 4 && preview) {
      handleSubmit(e);
    }
  };

  // 모달 닫기 (X 버튼)
  const handleClose = () => {
    console.log('[StudentIdModal] X 버튼 클릭 - 소개 페이지로 이동');
    // 학번 입력을 건너뛰고 소개 페이지로 이동
    window.location.href = '/about';
  };

  if (!show) return null;

  return (
    <div className="student-id-overlay" role="dialog" aria-modal="true" aria-labelledby="student-id-title">
      <div className="student-id-modal">
        <button
          className="student-id-close"
          onClick={handleClose}
          aria-label="학번 입력 건너뛰기"
        >
          ×
        </button>
        <div className="student-id-header">
          <div className="student-id-icon">🎓</div>
          <h1 id="student-id-title" className="student-id-title">
            학번을 입력해주세요
          </h1>
          <p className="student-id-subtitle">
            시간표를 자동으로 불러오기 위해 학번이 필요합니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="student-id-form">
          <div className="student-id-input-group">
            <label htmlFor="studentId" className="student-id-label">
              4자리 학번
            </label>
            <input
              id="studentId"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={studentId}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="1234"
              className={`student-id-input ${error ? 'error' : ''} ${preview ? 'valid' : ''}`}
              disabled={isSubmitting}
              autoFocus
              aria-describedby="student-id-hint"
            />
            <p id="student-id-hint" className="student-id-hint">
              예시: 1111 = 1학년 1반 11번
            </p>
          </div>

          {preview && (
            <div className="student-id-preview" role="status">
              <span className="preview-icon">✓</span>
              <span className="preview-text">{preview}</span>
            </div>
          )}

          {error && (
            <div className="student-id-error" role="alert">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="student-id-button"
            disabled={!preview || isSubmitting}
          >
            <span>{isSubmitting ? '등록 중...' : '시작하기 →'}</span>
          </button>
        </form>

        <div className="student-id-footer">
          <p className="student-id-note">
            학번은 나중에 설정에서 변경할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
