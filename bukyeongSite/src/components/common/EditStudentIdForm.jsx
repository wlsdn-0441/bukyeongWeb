/**
 * 학번 변경/삭제 인라인 폼 컴포넌트
 *
 * About 페이지에서 학번을 변경하거나 삭제할 수 있는 폼입니다.
 */

import { useState, useEffect } from 'react';
import { registerStudentId, clearStudentId } from '../../services/studentService';
import { formatStudentIdInput, parseStudentId } from '../../utils/studentIdParser';
import './EditStudentIdForm.css';

export default function EditStudentIdForm({ currentStudentData, onCancel, onComplete }) {
  const [newStudentId, setNewStudentId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  // 실시간 미리보기 (학번 입력 시 즉시 표시)
  useEffect(() => {
    if (newStudentId.length === 4) {
      const parsed = parseStudentId(newStudentId);
      if (parsed.isValid) {
        setPreview(parsed.formatted);
        setError('');
      } else {
        setPreview(null);
        setError(parsed.error);
      }
    } else {
      setPreview(null);
      setError('');
    }
  }, [newStudentId]);

  // 입력값 포맷팅 (숫자만 허용, 4자리 제한)
  const handleInputChange = (e) => {
    const formatted = formatStudentIdInput(e.target.value);
    setNewStudentId(formatted);
  };

  // 학번 변경 제출
  const handleChangeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsed = parseStudentId(newStudentId);
    if (!parsed.isValid) {
      setError(parsed.error);
      return;
    }

    if (newStudentId === currentStudentData.studentId) {
      setError('현재 학번과 동일합니다');
      return;
    }

    setIsSubmitting(true);
    console.log('[EditStudentIdForm] 학번 변경 시도:', newStudentId);

    try {
      // 기존 학번 삭제
      await clearStudentId();
      console.log('[EditStudentIdForm] 기존 학번 삭제 완료');

      // 새 학번 등록
      await registerStudentId(newStudentId);
      console.log('[EditStudentIdForm] 새 학번 등록 성공');

      // 페이지 새로고침
      window.location.reload();
    } catch (err) {
      console.error('[EditStudentIdForm] 학번 변경 실패:', err);
      setError(err.message || '학번 변경에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  // 학번 삭제
  const handleDelete = async () => {
    if (confirm('학번을 삭제하시겠습니까? 시간표를 이용하려면 다시 등록해야 합니다.')) {
      console.log('[EditStudentIdForm] 학번 삭제');
      await clearStudentId();
      console.log('[EditStudentIdForm] 페이지 새로고침 중...');
      window.location.reload();
    }
  };

  // 키보드 Enter 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newStudentId.length === 4 && preview) {
      handleChangeSubmit(e);
    }
  };

  return (
    <div className="edit-student-form">
      {/* 현재 학번 표시 */}
      <div className="edit-current-student">
        <div className="edit-current-label">현재 등록된 학번</div>
        <div className="edit-current-value">{currentStudentData.formatted}</div>
        <div className="edit-current-id">학번: {currentStudentData.studentId}</div>
      </div>

      {/* 새 학번 입력 */}
      <form onSubmit={handleChangeSubmit} className="edit-form">
        <div className="edit-input-group">
          <label htmlFor="newStudentId" className="edit-label">
            새 학번 (4자리)
          </label>
          <input
            id="newStudentId"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={newStudentId}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="1234"
            className={`edit-input ${error ? 'error' : ''} ${preview ? 'valid' : ''}`}
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        {preview && (
          <div className="edit-preview" role="status">
            <span className="preview-icon">✓</span>
            <span className="preview-text">{preview}</span>
          </div>
        )}

        {error && (
          <div className="edit-error" role="alert">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* 버튼 그룹 */}
        <div className="edit-button-group">
          <button
            type="submit"
            className="edit-button change"
            disabled={!preview || isSubmitting}
          >
            <span>{isSubmitting ? '변경 중...' : '변경하기'}</span>
          </button>
          <button
            type="button"
            className="edit-button delete"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            <span>삭제하기</span>
          </button>
          <button
            type="button"
            className="edit-button cancel"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <span>취소</span>
          </button>
        </div>
      </form>
    </div>
  );
}
