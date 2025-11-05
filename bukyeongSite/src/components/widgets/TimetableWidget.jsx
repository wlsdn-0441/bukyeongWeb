// src/components/widgets/Timetable.jsx
import { memo } from 'react';
import './TimetableWidget.css';

const TimetableWidget = memo(() => {
  const todaySchedule = [
    { time: '09:00', subject: '수학' },
    { time: '10:00', subject: '영어' },
    { time: '11:00', subject: '과학' },
  ];

  return (
    <div className="timetable-widget">
      {todaySchedule.map((item, index) => (
        <div
          key={index}
          className="timetable-item"
        >
          <span className="timetable-subject">
            {item.subject}
          </span>
          <span className="timetable-time">
            {item.time}
          </span>
        </div>
      ))}
    </div>
  );
});

TimetableWidget.displayName = 'TimetableWidget';

export default TimetableWidget;
