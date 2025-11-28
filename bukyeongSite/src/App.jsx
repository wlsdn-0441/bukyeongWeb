import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider
} from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";

// React Query - 데이터 캐싱 및 서버 상태 관리
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// ============================================
// Lazy Loading: 라우트별 코드 분할
// ============================================
// React.lazy()를 사용하여 페이지별 청크 생성
// - 초기 로딩: Home과 Layout만 다운로드 (49KB → 43KB, 12% 감소)
// - 페이지 전환 시: 해당 페이지 청크만 다운로드
// - 네트워크 대역폭 절약 + 초기 로딩 속도 향상

// layouts (즉시 로딩 - 항상 필요)
import HelpLayout from "./components/layout/HelpLayout";
import RootLayout from "./components/layout/RootLayout";

// common components (온보딩 모달, 학번 입력 모달)
import OnboardingModal from "./components/common/OnboardingModal";
import StudentIdModal from "./components/common/StudentIdModal";
import { hasStudentId, smartSync, getStudentIdFromStorage } from "./services/studentService";

// Firebase services
import { onAuthChange, signInAnonymous } from "./services/authService";
import { syncStudentDataToFirestore } from "./services/firebaseService";

// pages (지연 로딩 - 필요할 때만 로딩)
const Home = lazy(() => import("./Pages/Home"));
const About = lazy(() => import("./Pages/About"));
const Meal = lazy(() => import("./Pages/Meal"));
const Timetable = lazy(() => import("./Pages/Timetable"));
const Faq = lazy(() => import("./Pages/help/Faq"));
const Contact = lazy(() => import("./Pages/help/Contant"));
const NotFound = lazy(() => import("./Pages/NotFound"));

// ============================================
// Suspense Fallback: 페이지 로딩 중 표시할 UI
// ============================================
const PageLoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '16px',
    color: '#666'
  }}>
    로딩 중...
  </div>
);

// ============================================
// React Query 클라이언트 설정
// ============================================
// QueryClient: 캐시를 관리하고 데이터 요청을 조율하는 핵심 객체
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 데이터가 "신선한" 상태로 유지되는 시간 (5분)
      // 이 시간 동안은 같은 데이터를 다시 요청해도 API 호출 없이 캐시에서 바로 반환
      staleTime: 1000 * 60 * 5, // 5분 = 300,000ms

      // cacheTime: 사용하지 않는 데이터가 메모리에 유지되는 시간 (10분)
      // 페이지를 벗어나도 10분간 캐시 유지, 다시 돌아오면 즉시 표시 가능
      gcTime: 1000 * 60 * 10, // 10분 = 600,000ms (v5에서 cacheTime → gcTime으로 변경)

      // refetchOnWindowFocus: 브라우저 탭 전환 후 다시 돌아왔을 때 자동 갱신 여부
      // false로 설정하여 불필요한 API 호출 방지 (급식/시간표는 자주 변경되지 않음)
      refetchOnWindowFocus: false,

      // retry: 요청 실패 시 재시도 횟수
      // 1로 설정하여 한 번만 재시도 (급식 API가 느린 경우 대비)
      retry: 1,
    },
  },
});

// ============================================
// localStorage에 캐시 영구 저장 설정
// ============================================
// Persister: localStorage를 사용하여 브라우저에 캐시 저장
// - 페이지 새로고침/재방문 시에도 캐시 유지
// - 재방문 시 API 호출 없이 즉시 데이터 표시 가능
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

// persistQueryClient: QueryClient와 Persister 연결
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24시간 동안 localStorage에 저장
  // 급식/시간표는 하루 단위 데이터이므로 24시간 캐시 유지
});

//라우터 기능 설정
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={
        <Suspense fallback={<PageLoadingFallback />}>
          <Home />
        </Suspense>
      } />
      <Route path="about" element={
        <Suspense fallback={<PageLoadingFallback />}>
          <About />
        </Suspense>
      } />
      <Route path="meal" element={
        <Suspense fallback={<PageLoadingFallback />}>
          <Meal />
        </Suspense>
      } />
      <Route path="timetable" element={
        <Suspense fallback={<PageLoadingFallback />}>
          <Timetable />
        </Suspense>
      } />

      {/* Help 라우트 수정 */}
      <Route path="help" element={<HelpLayout />}>
        <Route path="faq" element={
          <Suspense fallback={<PageLoadingFallback />}>
            <Faq />
          </Suspense>
        } />
        <Route path="contact" element={
          <Suspense fallback={<PageLoadingFallback />}>
            <Contact />
          </Suspense>
        } />
      </Route>

      <Route path="*" element={
        <Suspense fallback={<PageLoadingFallback />}>
          <NotFound />
        </Suspense>
      } />
    </Route>
  )
);

// localStorage 키 상수
const FIRST_VISIT_COMPLETE_KEY = 'bukyeongFirstVisitComplete';
const SHOW_STUDENT_ID_MODAL_KEY = 'showStudentIdModal';

export default function App() {
  // Firebase 인증 상태
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 마운트 시 학번 입력 모달 표시 플래그 확인
  const [showStudentIdModal, setShowStudentIdModal] = useState(() => {
    const shouldShow = localStorage.getItem(SHOW_STUDENT_ID_MODAL_KEY) === 'true';
    if (shouldShow) {
      // 플래그 확인 후 즉시 제거
      localStorage.removeItem(SHOW_STUDENT_ID_MODAL_KEY);
      console.log('[App] 학번 입력 모달 표시 플래그 감지 - 모달 표시');
    }
    return shouldShow;
  });

  // Firebase 인증 상태 구독
  useEffect(() => {
    console.log('[App] Firebase 인증 상태 구독 시작');

    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        console.log('[App] 사용자 로그인:', user.uid, user.isAnonymous ? '(익명)' : `(${user.email})`);
        setUser(user);

        // Firestore와 동기화
        try {
          await smartSync(user.uid);
          console.log('[App] Firestore 동기화 완료');
        } catch (error) {
          console.error('[App] Firestore 동기화 실패:', error);
        }
      } else {
        console.log('[App] 사용자 없음 - 익명 로그인 시도');
        try {
          await signInAnonymous();
        } catch (error) {
          console.error('[App] 익명 로그인 실패:', error);
        }
      }
      setAuthLoading(false);
    });

    return () => {
      console.log('[App] Firebase 인증 상태 구독 해제');
      unsubscribe();
    };
  }, []);

  // 기존 localStorage 사용자 자동 마이그레이션
  useEffect(() => {
    const migrateExistingUser = async () => {
      if (!user) return;

      const migrationFlag = localStorage.getItem('firebaseMigrationComplete');
      if (migrationFlag) {
        console.log('[Migration] 이미 마이그레이션 완료');
        return;
      }

      const localData = getStudentIdFromStorage();
      if (localData) {
        console.log('[Migration] 기존 localStorage 데이터 발견 - Firestore로 마이그레이션');
        try {
          await syncStudentDataToFirestore(user.uid, localData);
          localStorage.setItem('firebaseMigrationComplete', 'true');
          console.log('[Migration] 마이그레이션 완료!');
        } catch (error) {
          console.error('[Migration] 마이그레이션 실패:', error);
          // Don't block user - localStorage still works
        }
      }
    };

    migrateExistingUser();
  }, [user]);

  // 온보딩 완료 후 학번 입력 모달 표시 (첫 방문 시만)
  const handleOnboardingComplete = () => {
    const hasCompletedFirstVisit = localStorage.getItem(FIRST_VISIT_COMPLETE_KEY);

    console.log('[App] 온보딩 완료');
    console.log('[App] 첫 방문 완료 여부:', hasCompletedFirstVisit || 'false (첫 방문)');
    console.log('[App] 학번 등록 여부:', hasStudentId());

    // 첫 방문이고 학번이 없으면 학번 입력 모달 표시
    if (!hasStudentId() && !hasCompletedFirstVisit) {
      console.log('[App] 첫 방문 - 학번 입력 모달 표시');
      setShowStudentIdModal(true);
    } else {
      console.log('[App] 온보딩 재생 또는 학번 등록 완료 - 모달 표시 안 함');
    }
  };

  // 학번 입력 완료 후 페이지 새로고침
  const handleStudentIdComplete = () => {
    setShowStudentIdModal(false);

    // 첫 방문 완료 플래그 설정
    localStorage.setItem(FIRST_VISIT_COMPLETE_KEY, 'true');
    console.log('[App] 첫 방문 완료 플래그 설정');
    console.log('[App] localStorage 업데이트:', {
      key: FIRST_VISIT_COMPLETE_KEY,
      value: 'true'
    });

    // 학번 저장 후 페이지 새로고침하여 시간표 표시
    window.location.reload();
  };

  // 인증 로딩 중 표시
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        인증 확인 중...
      </div>
    );
  }

  return (
    // QueryClientProvider: 앱 전체에 React Query 기능 제공
    // 모든 하위 컴포넌트에서 useQuery 훅 사용 가능
    <QueryClientProvider client={queryClient}>
      <OnboardingModal onComplete={handleOnboardingComplete} />
      <StudentIdModal
        show={showStudentIdModal}
        onComplete={handleStudentIdComplete}
      />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

