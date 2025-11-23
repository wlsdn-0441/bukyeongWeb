import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider
} from "react-router-dom";

// React Query - 데이터 캐싱 및 서버 상태 관리를 위한 라이브러리
// 급식, 시간표 데이터를 캐싱하여 페이지 이동 시 즉시 표시
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

//pages
import Home from "./Pages/Home";
import About from "./Pages/About";
import Faq from "./Pages/help/Faq";
import Contact from "./Pages/help/Contant";
import NotFound from "./Pages/NotFound";
import Meal from "./Pages/Meal";
import Timetable from "./Pages/Timetable";

// layouts
import HelpLayout from "./components/layout/HelpLayout";
import RootLayout from "./components/layout/RootLayout";

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

//라우터 기능 설정
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="meal" element={<Meal />} />
      <Route path="timetable" element={<Timetable />} />

      {/* Help 라우트 수정 */}
      <Route path="help" element={<HelpLayout />}>
        <Route path="faq" element={<Faq />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default function App() {
  return (
    // QueryClientProvider: 앱 전체에 React Query 기능 제공
    // 모든 하위 컴포넌트에서 useQuery 훅 사용 가능
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

