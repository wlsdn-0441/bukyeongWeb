// src/components/widgets/TimetableWidget.jsx
import { memo, useState, useEffect } from 'react';
import { getTodayTimetable } from '../../services/timetableService';
import './TimetableWidget.css';

const TimetableWidget = memo(({ grade = "2", classNum = "6" }) => {
  const [todayTimetable, setTodayTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTodayTimetable = async () => {
      try {
        setLoading(true);
        const data = await getTodayTimetable(grade, classNum);
        setTodayTimetable(data);
        setError(null);
      } catch (err) {
        console.error('시간표 데이터 로딩 실패:', err);
        setError('시간표 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadTodayTimetable();
  }, [grade, classNum]);

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
