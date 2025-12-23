/**
 * Authentication Button Component
 *
 * Displays:
 * - "Google 로그인" button for anonymous users
 * - User email for authenticated users
 */

import { useState, useEffect } from 'react';
import { signInWithGoogle, linkAnonymousToGoogle, isAnonymous, signOut } from '../../services/authService';
import './AuthButton.css';

export default function AuthButton({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 사용자 상태 로그 (디버깅용)
  useEffect(() => {
    console.log('[AuthButton] ========== 렌더링됨 ==========');
    console.log('[AuthButton] 사용자 정보:');
    if (user) {
      console.log('  - UID:', user.uid);
      console.log('  - 이메일:', user.email || '(없음)');
      console.log('  - 익명 여부:', user.isAnonymous);
      console.log('  - isAnonymous():', isAnonymous());
    } else {
      console.log('  - user = null');
    }
  }, [user]);

  // 리다이렉트 후 에러 확인
  useEffect(() => {
    const savedError = localStorage.getItem('authError');
    if (savedError) {
      try {
        const parsedError = JSON.parse(savedError);
        console.log('[AuthButton] localStorage에서 에러 발견:', parsedError);
        setError(parsedError);
        localStorage.removeItem('authError');
      } catch (e) {
        console.error('[AuthButton] 에러 파싱 실패:', e);
      }
    }
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    console.log('[AuthButton] ========== 로그인 버튼 클릭 ==========');
    console.log('[AuthButton] 현재 상태:', {
      userExists: !!user,
      isAnonymous: isAnonymous(),
      userEmail: user?.email,
      userUid: user?.uid
    });

    try {
      if (isAnonymous()) {
        console.log('[AuthButton] ✅ 익명 계정 감지 → linkAnonymousToGoogle() 호출');
        await linkAnonymousToGoogle();
      } else {
        console.log('[AuthButton] ✅ 인증된 계정 → signInWithGoogle() 호출');
        await signInWithGoogle();
      }
      // 리다이렉트 방식이므로 여기에 도달하지 않음 (페이지가 Google로 이동)
    } catch (error) {
      console.error('[AuthButton] ❌ 로그인 실패:', error);
      setError({
        type: 'general',
        message: error.message || '로그인에 실패했습니다.'
      });
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
