// src/components/widgets/TimetableWidget.jsx
import { memo } from 'react';
import { useQuery } from '@tanstack/react-query'; // React Query 훅 import
import { getTodayTimetable } from '../../services/timetableService';
import './TimetableWidget.css';

const TimetableWidget = memo(({ grade = "2", classNum = "6" }) => {
  // ============================================
  // React Query를 사용한 시간표 데이터 캐싱
  // ============================================
  // useQuery: 서버 데이터를 가져오고 자동으로 캐싱하는 훅
  // - 장점 1: 홈에서 불러온 시간표를 Timetable 페이지에서 재사용 가능
  // - 장점 2: 학년/반이 바뀌면 자동으로 새 데이터 요청 (queryKey 변경 감지)
  // - 장점 3: 중복 요청 자동 제거
  const {
    data: todayTimetable,    // 서버에서 받아온 시간표 데이터
    isLoading: loading,      // 로딩 중 여부 (true/false)
    error,                   // 에러 객체 (에러 발생 시)
  } = useQuery({
    // queryKey: 캐시를 식별하는 고유 키
    // ['timetable', 'today', grade, classNum] → "특정 학년/반의 오늘 시간표" 식별
    // grade나 classNum이 바뀌면 자동으로 새로운 데이터 요청
    // 예: ['timetable', 'today', '2', '6'] → 2학년 6반 오늘 시간표
    queryKey: ['timetable', 'today', grade, classNum],

    // queryFn: 실제 데이터를 가져오는 함수
    // getTodayTimetable(grade, classNum)를 호출하여 오늘 시간표 fetch
    queryFn: () => getTodayTimetable(grade, classNum),

    // staleTime: 시간표는 하루 단위로 변경되므로 5분간 캐시 유지
    staleTime: 1000 * 60 * 5, // 5분
  });

  if (loading) {
    return (
      <div className="timetable-widget">
        <div className="timetable-widget-loading">시간표 정보 로딩 중...</div>
      </div>
    );
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
