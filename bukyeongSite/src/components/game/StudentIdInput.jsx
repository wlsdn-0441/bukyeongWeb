/**
 * Student ID Input Component
 *
 * 4-digit student ID input with validation
 * Used for claiming game scores
 */

import { useState, useEffect } from 'react';
import { parseStudentId } from '../../utils/studentIdParser';
import './StudentIdInput.css';

export default function StudentIdInput({ onSubmit, initialValue = '', autoFocus = true }) {
  const [studentId, setStudentId] = useState(initialValue);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (studentId.length === 4) {
      const parsed = parseStudentId(studentId);
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
  }, [studentId]);

  const handleChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value) && value.length <= 4) {
      setStudentId(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (preview) {
      onSubmit(studentId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-id-input-form">
      <div className="input-wrapper">
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={studentId}
          onChange={handleChange}
          placeholder="1234"
          autoFocus={autoFocus}
          className={`student-id-input ${error ? 'error' : preview ? 'valid' : ''}`}
          aria-label="학번 입력"
        />
        {preview && <div className="input-preview">{preview}</div>}
        {error && <div className="input-error">{error}</div>}
      </div>
      <button
        type="submit"
        disabled={!preview}
        className="submit-button"
      >
        확인
      </button>
    </form>
  );
}
