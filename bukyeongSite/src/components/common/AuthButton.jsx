/**
 * Authentication Button Component
 *
 * Displays:
 * - "Google 로그인" button for anonymous users
 * - User email for authenticated users
 */

import { useState } from 'react';
import { signInWithGoogle, linkAnonymousToGoogle, isAnonymous } from '../../services/authService';
import './AuthButton.css';

export default function AuthButton({ user }) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      if (isAnonymous()) {
        console.log('[AuthButton] 익명 계정을 Google 계정에 연결');
        await linkAnonymousToGoogle();
      } else {
        console.log('[AuthButton] Google 로그인 시도');
        await signInWithGoogle();
      }
      console.log('[AuthButton] 로그인 성공');
      // 페이지 새로고침하여 동기화된 데이터 표시
      window.location.reload();
    } catch (error) {
      console.error('[AuthButton] 로그인 실패:', error);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Loading auth state
  }

  if (user.isAnonymous) {
    return (
      <button
        className="auth-button signin"
        onClick={handleSignIn}
        disabled={loading}
        aria-label="Google 로그인"
      >
        {loading ? '로그인 중...' : 'Google 로그인'}
      </button>
    );
  }

  return (
    <div className="auth-info">
      <span className="auth-email">{user.email}</span>
    </div>
  );
}
