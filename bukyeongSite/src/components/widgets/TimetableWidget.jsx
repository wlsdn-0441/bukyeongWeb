// src/components/widgets/TimetableWidget.jsx
import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query'; // React Query 훅 import
import { getTodayTimetable } from '../../services/timetableService';
import { getNextSchoolDay, formatDateToYYYYMMDD } from '../../services/dateUtils';
import { getStudentIdFromStorage } from '../../services/studentService';
import TimetableSkeleton from '../common/TimetableSkeleton';
import './TimetableWidget.css';

const TimetableWidget = memo(() => {
  // localStorage에서 학번 정보 읽기
  const studentData = getStudentIdFromStorage();

  // 학번이 없으면 메시지 표시
  if (!studentData) {
    return (
      <div className="timetable-widget">
        <div className="timetable-widget-header">
          <h2 className="timetable-widget-title">오늘의 시간표</h2>
        </div>
        <div className="timetable-widget-empty">
          <p>학번을 먼저 등록해주세요</p>
          <p className="timetable-hint">설정 페이지에서 등록 가능합니다</p>
        </div>
      </div>
    );
  }

  const { grade, classNum } = studentData;
  // ============================================
  // 다음 학교일 계산 (캐싱 키에 사용)
  // ============================================
  // useMemo: 컴포넌트가 리렌더링되어도 날짜 계산을 한 번만 수행
  // - 평일 19시 이전: 오늘 날짜
  // - 평일 19시 이후: 다음 학교일 날짜
  // - 주말: 다음 주 월요일 날짜
  const schoolDateStr = useMemo(() => {
    const schoolDay = getNextSchoolDay();
    return formatDateToYYYYMMDD(schoolDay);
  }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 계산

  // ============================================
  // React Query를 사용한 시간표 데이터 캐싱
  // ============================================
  // useQuery: 서버 데이터를 가져오고 자동으로 캐싱하는 훅
  // - 장점 1: 홈에서 불러온 시간표를 Timetable 페이지에서 재사용 가능
  // - 장점 2: 학년/반이 바뀌면 자동으로 새 데이터 요청 (queryKey 변경 감지)
  // - 장점 3: 중복 요청 자동 제거
  // - 장점 4: 날짜가 바뀌면 자동으로 새 캐시 생성 (queryKey에 날짜 포함)
  const {
    data: todayTimetable,    // 서버에서 받아온 시간표 데이터
    isLoading: loading,      // 로딩 중 여부 (true/false)
    error,                   // 에러 객체 (에러 발생 시)
  } = useQuery({
    // queryKey: 캐시를 식별하는 고유 키
    // ['timetable', schoolDateStr, grade, classNum] → "특정 날짜/학년/반의 시간표" 식별
    // 예: ['timetable', '20251123', '2', '6'] → 2025년 11월 23일 2학년 6반 시간표
    // 19시가 지나거나 날짜가 바뀌면 schoolDateStr이 변경되어 새 캐시 생성
    queryKey: ['timetable', schoolDateStr, grade, classNum],

    // queryFn: 실제 데이터를 가져오는 함수
    // getTodayTimetable(grade, classNum)를 호출하여 다음 학교일 시간표 fetch
    queryFn: () => getTodayTimetable(grade, classNum),

    // staleTime: 시간표는 하루 단위로 변경되므로 5분간 캐시 유지
    staleTime: 1000 * 60 * 5, // 5분
  });

  if (loading) {
    return <TimetableSkeleton />;
  }

  if (error || !todayTimetable) {
    return (
      <div className="timetable-widget">
        <div className="timetable-widget-error">
          {error || '시간표 정보를 불러올 수 없습니다.'}
        </div>
      </div>
    );
  }

  return (
    <div className="timetable-widget">
      <div className="timetable-widget-header">
        <h2 className="timetable-widget-title">오늘의 시간표</h2>
        <div className="timetable-widget-info">
          <p className="timetable-widget-day">{todayTimetable.day}</p>
          <p className="timetable-widget-date">
            {todayTimetable.date.slice(4, 6)}/{todayTimetable.date.slice(6, 8)}
          </p>
          <p className="timetable-widget-class">
            {todayTimetable.grade}학년 {todayTimetable.classNum}반
          </p>
        </div>
      </div>

      <div className="timetable-content">
        {todayTimetable.timetable.length > 0 ? (
          <ul className="timetable-list">
            {todayTimetable.timetable.map((item, idx) => (
              <li key={idx} className="timetable-item">
                <span className="timetable-period">{item.period}교시</span>
                <span className="timetable-subject">{item.subject}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="timetable-empty">
            <p>오늘은 시간표 정보가 없습니다.</p>
            <p className="timetable-empty-hint">(주말 또는 공휴일)</p>
          </div>
        )}
      </div>
    </div>
  );
});

TimetableWidget.displayName = 'TimetableWidget';

export default TimetableWidget;
