// src/Pages/Timetable.jsx
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // React Query 훅 import
import Card from '../components/common/Card';
import { getWeekTimetable } from '../services/timetableService';
import { getStudentIdFromStorage } from '../services/studentService';
import './Timetable.css';

const Timetable = () => {
  const navigate = useNavigate();

  // localStorage에서 학번 정보 읽기
  const studentData = getStudentIdFromStorage();

  // 학번이 없으면 설정 페이지로 안내
  if (!studentData) {
    return (
      <div className="timetable-page">
        <button
          onClick={() => navigate('/')}
          className="timetable-back-button"
        >
          ← 홈으로 돌아가기
        </button>
        <div className="timetable-empty-state">
          <div className="timetable-empty-icon">📚</div>
          <h2 className="timetable-empty-title">학번을 먼저 등록해주세요</h2>
          <p className="timetable-empty-description">
            학번을 등록하면 우리 반 시간표를 확인할 수 있습니다
          </p>
          <button
            onClick={() => navigate('/about')}
            className="timetable-settings-button"
          >
            설정으로 이동 →
          </button>
        </div>
      </div>
    );
  }

  const { grade, classNum } = studentData;

  // ============================================
  // React Query를 사용한 주간 시간표 데이터 캐싱
  // ============================================
  // useQuery: 월~금 시간표 데이터를 가져오고 캐싱
  // - TimetableWidget에서 이미 오늘 시간표를 불러왔다면, 그 데이터는 캐시에 존재
  // - 이 페이지에서 주간 시간표를 요청하면, 오늘 시간표는 재사용되고 나머지만 fetch
  const {
    data: weekTimetables = [],  // 서버에서 받아온 주간 시간표 배열 (기본값: 빈 배열)
    isLoading: loading,          // 로딩 중 여부
    error,                       // 에러 객체
  } = useQuery({
    // queryKey: 캐시를 식별하는 고유 키
    // ['timetable', 'week', grade, classNum] → "특정 학년/반의 이번 주 시간표" 식별
    // grade나 classNum이 바뀌면 자동으로 새로운 데이터 요청
    // 예: ['timetable', 'week', '2', '6'] → 2학년 6반 주간 시간표
    queryKey: ['timetable', 'week', grade, classNum],

    // queryFn: 실제 데이터를 가져오는 함수
    // getWeekTimetable(grade, classNum)를 호출하여 월~금 시간표 fetch (5개 API 호출)
    queryFn: () => getWeekTimetable(grade, classNum),

    // staleTime: 주간 시간표는 자주 변경되지 않으므로 10분간 캐시 유지
    // 사용자가 페이지를 왔다갔다해도 10분간은 API 재호출 안 함
    staleTime: 1000 * 60 * 10, // 10분
  });

  if (loading) {
    return (
      <div className="timetable-page">
        <button
          onClick={() => navigate('/')}
          className="timetable-back-button"
        >
          ← 홈으로 돌아가기
        </button>
        <div className="timetable-loading">시간표 정보를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <div className="timetable-page">
        <button
          onClick={() => navigate('/')}
          className="timetable-back-button"
        >
          ← 홈으로 돌아가기
        </button>
        <div className="timetable-error">
          {error.message || '시간표 정보를 불러오는데 실패했습니다.'}
        </div>
      </div>
    );
  }

  return (
    <div className="timetable-page">
      <button
        onClick={() => navigate('/')}
        className="timetable-back-button"
      >
        ← 홈으로 돌아가기
      </button>

      <h1 className="timetable-page-title">
        이번 주 시간표
      </h1>
      <p className="timetable-page-subtitle">
        {grade}학년 {classNum}반
      </p>

      <div className="timetable-cards-container">
        {weekTimetables.map((daySchedule, index) => (
          <Card
            key={index}
            title={`${daySchedule.day} (${daySchedule.date})`}
          >
            <div className="timetable-card-content">
              {daySchedule.timetable.length > 0 ? (
                <ul className="timetable-schedule-list">
                  {daySchedule.timetable.map((item, idx) => (
                    <li key={idx} className="timetable-schedule-item">
                      <span className="timetable-schedule-period">
                        {item.period}교시
                      </span>
                      <span className="timetable-schedule-subject">
                        {item.subject}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="timetable-empty">
                  <p>시간표 정보 없음</p>
                  <p className="timetable-empty-hint">(주말 또는 공휴일)</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Timetable;
