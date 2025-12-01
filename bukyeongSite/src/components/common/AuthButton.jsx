/**
 * Authentication Button Component
 *
 * Displays:
 * - "Google 로그인" button for anonymous users
 * - User email for authenticated users
 */

import { useState } from 'react';
import { signInWithGoogle, linkAnonymousToGoogle, isAnonymous, signOut } from '../../services/authService';
import './AuthButton.css';

export default function AuthButton({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
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

      // Handle domain restriction error
      if (error.message === 'DOMAIN_NOT_ALLOWED') {
        setError({
          type: 'domain',
          email: error.email
        });
      } else if (error.code === 'auth/popup-closed-by-user') {
        // User closed popup - no error message needed
        setError(null);
      } else {
        setError({
          type: 'general',
          message: error.message || '로그인에 실패했습니다.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('로그아웃하시겠습니까?\n\n로그아웃 후 익명 계정으로 전환되며, 학번 데이터는 안전하게 보관됩니다.')) {
      setLoading(true);
      try {
        console.log('[AuthButton] 로그아웃 시도');
        await signOut();
        console.log('[AuthButton] 로그아웃 성공');
        // 페이지 새로고침하여 익명 계정으로 재로그인
        window.location.reload();
      } catch (error) {
        console.error('[AuthButton] 로그아웃 실패:', error);
        alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) {
    return null; // Loading auth state
  }

  if (user.isAnonymous) {
    return (
      <div className="auth-container">
        <button
          className="auth-button signin"
          onClick={handleSignIn}
          disabled={loading}
          aria-label="Google 로그인"
        >
          {loading ? '로그인 중...' : 'Google 로그인'}
        </button>

        {error && (
          <div className="auth-error-message">
            {error.type === 'domain' ? (
              <>
                <div className="error-icon">⚠️</div>
                <div className="error-content">
                  <div className="error-title">학교 공식계정만 로그인 가능합니다</div>
                  <div className="error-detail">
                    <strong>@saja.hs.kr</strong> 도메인의 이메일만 사용 가능합니다.
                  </div>
                  <div className="error-attempted">
                    시도한 이메일: <span className="error-email">{error.email}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="error-icon">⚠️</div>
                <div className="error-content">
                  <div className="error-title">로그인 실패</div>
                  <div className="error-detail">{error.message}</div>
                </div>
              </>
            )}
            <button className="error-close" onClick={() => setError(null)}>✕</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="auth-info">
      <span className="auth-email">{user.email}</span>
      <button
        className="auth-button signout"
        onClick={handleSignOut}
        disabled={loading}
        aria-label="로그아웃"
      >
        {loading ? '로그아웃 중...' : '로그아웃'}
      </button>
    </div>
  );
}
