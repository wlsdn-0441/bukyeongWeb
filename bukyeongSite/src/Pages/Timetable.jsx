// src/Pages/Timetable.jsx
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import './Timetable.css';

const Timetable = () => {
  const navigate = useNavigate();

  const weekSchedule = {
    monday: [
      { time: '09:00 - 10:00', subject: '수학', teacher: '김선생님', room: '201' },
      { time: '10:00 - 11:00', subject: '영어', teacher: '이선생님', room: '202' },
      { time: '11:00 - 12:00', subject: '과학', teacher: '박선생님', room: '실험실' },
      { time: '13:00 - 14:00', subject: '체육', teacher: '최선생님', room: '운동장' },
    ],
    tuesday: [
      { time: '09:00 - 10:00', subject: '국어', teacher: '정선생님', room: '201' },
      { time: '10:00 - 11:00', subject: '수학', teacher: '김선생님', room: '201' },
      { time: '11:00 - 12:00', subject: '음악', teacher: '송선생님', room: '음악실' },
      { time: '13:00 - 14:00', subject: '미술', teacher: '강선생님', room: '미술실' },
    ],
    // ... 나머지 요일
  };

  const days = [
    { key: 'monday', label: '월요일' },
    { key: 'tuesday', label: '화요일' },
    { key: 'wednesday', label: '수요일' },
    { key: 'thursday', label: '목요일' },
    { key: 'friday', label: '금요일' },
  ];

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

      <div className="timetable-cards-container">
        {days.map((day) => (
          <Card key={day.key} title={day.label}>
            <div className="timetable-schedule">
              {weekSchedule[day.key]?.map((item, index) => (
                <div
                  key={index}
                  className="timetable-schedule-item"
                >
                  <div className="timetable-schedule-left">
                    <p className="timetable-schedule-subject">
                      {item.subject}
                    </p>
                    <p className="timetable-schedule-time">
                      {item.time}
                    </p>
                  </div>
                  <div className="timetable-schedule-right">
                    <span className="timetable-schedule-teacher">
                      {item.teacher}
                    </span>
                    <p className="timetable-schedule-room">
                      {item.room}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Timetable;
