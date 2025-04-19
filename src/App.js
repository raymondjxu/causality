import './App.css';
import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import ReactDOM from 'react-dom/client';

function App() {
  // Change events to objects with a label and y position
  const [fixedEvents, setFixedEvents] = useState([
    { label: 'Event 1'},
    { label: 'Event 2'},
    { label: 'Event 3'},
  ]);

  const timelineRef = useRef(null);

  // baseY should be the y position of the first event; it's the middle of the timeline
  const [baseY, setBaseY] = useState(0);

  const eventSpacing = 70; // Adjust spacing as needed

  React.useEffect(() => {
    if (timelineRef.current) {
      setBaseY(timelineRef.current.offsetHeight / 2 - eventSpacing * (fixedEvents.length) / 2);
    }
  }, []);
    
  const mapIndexToY = (index) => {
    return baseY + index * eventSpacing; // Adjust spacing as needed
  }

  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
  const draggableRef = useRef(null);

  // calculate the index of the draggable event based on its y position
  const getFullTimelineIncludingProspectiveEvent = () => {
    if(!!timelineRef.current && (draggablePosition.x - (timelineRef.current.offsetLeft + timelineRef.current.width)/2) > 20) {
      console.log("Draggable event position is", draggablePosition);
      console.log("Timeline offset is", timelineRef.current.offsetLeft);
      return fixedEvents;
    }

    const index = Math.floor((draggablePosition.y - baseY) / eventSpacing);
    const prospectiveEvent = {
      label: 'Prospective Event',
      type: 'prospective',
      y: draggablePosition.y,
    };
    const fullTimeline = [...fixedEvents];
    if (index >= 0 && index < fullTimeline.length) {
      fullTimeline.splice(index, 0, prospectiveEvent);
    } else if (index === fullTimeline.length) {
      fullTimeline.push(prospectiveEvent);
    }
    return fullTimeline;

  };

  const handleStop = (e, data) => {
    // reset the draggable, add the event to the timeline
    const index = Math.floor((data.y - baseY) / eventSpacing);
    const newEvent = {
      label: 'New Event' + Math.random(),
      //type: 'prospective',
      y: data.y,
    };
    const fullTimeline = [...fixedEvents];
    if (index >= 0 && index < fullTimeline.length) {
      fullTimeline.splice(index, 0, newEvent);
    } else if (index === fullTimeline.length) {
      fullTimeline.push(newEvent);
    }
    setFixedEvents(fullTimeline);
    setDraggablePosition({ x: 0, y: 0 });
    setBaseY(timelineRef.current.offsetHeight / 2 - eventSpacing * (fullTimeline.length) / 2);
    console.log("New event added to timeline", newEvent);
    console.log("New timeline is", fullTimeline);
    console.log("New baseY is", baseY);
    console.log("New draggable position is", draggablePosition);
    console.log("New timeline offset is", timelineRef.current.offsetLeft);
  }

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ textAlign: 'center', padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
          <h1>Timeline of Events</h1>
        </header>
        {/* Set timeline area to relative for absolute event positioning */}
        <main style={{ position: 'relative', height: '100%', overflow: 'hidden' }} ref={timelineRef}>
          {getFullTimelineIncludingProspectiveEvent().map((event, index) => (
            <div key={index} style={{
                position: 'absolute',
                top: `${mapIndexToY(index)}px`,
                left: 'calc(50% - 100px)',
                width: '200px',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: event.type === 'prospective' ? '#f8d7da' : '#e2e3e5',
                border: '1px solid #ccc',
                borderRadius: '5px',
                textAlign: 'center'
              }}>
              {event.label}
            </div>
          ))}
        </main>
      </div>
      <div style={{ width: '200px', padding: '20px', backgroundColor: '#f9f9f9', borderLeft: '1px solid #ccc' }}>
        <h2 style={{ textAlign: 'center' }}>Draggable Event</h2>
        <Draggable
          nodeRef={draggableRef}
          position={draggablePosition}
          onDrag={(e, data) => {
            setDraggablePosition({ x: data.x, y: data.y });
          }}
          onStop={handleStop}
          //onDrag={(e, data) => handleDrag({ x: data.x, y: data.y })}
         >
          <div ref={draggableRef} style={{
              width: '150px',
              padding: '10px',
              backgroundColor: '#d1e7dd',
              border: '1px solid #0f5132',
              borderRadius: '5px',
              textAlign: 'center',
              cursor: 'move'
            }}>
            Drag Me
          </div>
        </Draggable>
      </div>
    </div>
  );
}

export default App;
