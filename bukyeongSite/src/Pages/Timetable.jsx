// src/Pages/Timetable.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { getWeekTimetable } from '../services/timetableService';
import './Timetable.css';

const Timetable = ({ grade = "2", classNum = "6" }) => {
  const navigate = useNavigate();
  const [weekTimetables, setWeekTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWeekTimetables = async () => {
      try {
        setLoading(true);
        const data = await getWeekTimetable(grade, classNum);
        setWeekTimetables(data);
        setError(null);
      } catch (err) {
        console.error('시간표 데이터 로딩 실패:', err);
        setError('시간표 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWeekTimetables();
  }, [grade, classNum]);

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

  if (error) {
    return (
      <div className="timetable-page">
        <button
          onClick={() => navigate('/')}
          className="timetable-back-button"
        >
          ← 홈으로 돌아가기
        </button>
        <div className="timetable-error">{error}</div>
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
