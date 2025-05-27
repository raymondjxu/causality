import './App.css';
import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import ReactDOM from 'react-dom/client';

// Import the ordered list of events from a separate file


function EventListSelector({ manifest, onSelect }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 320 }}>
        <h2>Select an Event List</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {manifest.map((item, idx) => (
            <li key={item.filename} style={{ margin: '16px 0' }}>
              <button onClick={() => onSelect(item)} style={{ width: '100%', padding: 12, borderRadius: 4, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer', textAlign: 'left' }}>
                <strong>{item.name}</strong>
                <div style={{ fontSize: 14, color: '#555' }}>{item.description}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

  // Types for event objects
  /**
   * @typedef {{ label: string, [key: string]: any }} EventObj
   */

function App() {
  // Manifest of available event lists
  const [eventListManifest, setEventListManifest] = React.useState(null);
  // The selected event list filename (from manifest)
  const [selectedEventList, setSelectedEventList] = React.useState(null);
  // State for the ordered list of events, fetched from a remote JSON file
  /** @type {[EventObj[], Function]} */
  const [orderedEventList, setOrderedEventList] = React.useState(/** @type {EventObj[]} */([]));
  /** @type {[EventObj[], Function]} */
  const [fixedEvents, setFixedEvents] = useState(/** @type {EventObj[]} */([]));

  // Fetch the manifest on mount
  React.useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/eventListManifest.json')
      .then(res => res.json())
      .then(data => setEventListManifest(data));
  }, []);

  // When a list is selected, fetch its events and fixed events
  React.useEffect(() => {
    if (selectedEventList) {
      fetch(process.env.PUBLIC_URL + '/' + selectedEventList.filename)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Backward compatibility: treat as events only
            setOrderedEventList(data);
            setFixedEvents([]);
          } else {
            setOrderedEventList(data.events || []);
            setFixedEvents(data.fixed || []);
          }
        });
    }
  }, [selectedEventList]);


  // Use a generic ref, compatible with null for initial value
  /** @type {React.RefObject<HTMLDivElement>} */
  const timelineRef = useRef(null);
  const [baseY, setBaseY] = useState(0);
  // Only declare draggable state and ref once
  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
  /** @type {React.RefObject<HTMLDivElement>} */
  const draggableRef = useRef(null);

    const eventSpacing = 70; // Adjust spacing as needed

  React.useEffect(() => {
    if (timelineRef.current && timelineRef.current.offsetHeight) {
      setBaseY(timelineRef.current.offsetHeight / 2 - eventSpacing * (fixedEvents.length) / 2);
    }
  }, [fixedEvents.length]);

  // Early return for selector, but after all hooks
  if (eventListManifest && !selectedEventList) {
    return <EventListSelector manifest={eventListManifest} onSelect={setSelectedEventList} />;
  }

  // baseY should be the y position of the first event; it's the middle of the timeline
  //const [baseY, setBaseY] = useState(0);

  
    
  const mapIndexToY = (index) => {
    return baseY + index * eventSpacing; // Adjust spacing as needed
  }


  // Find the next event from the ordered list that is not already on the timeline
  const getNextAvailableEvent = () => {
    const timelineLabels = fixedEvents.map(ev => ev.label);
    for (let i = 0; i < orderedEventList.length; i++) {
      if (!timelineLabels.includes(orderedEventList[i].label)) {
        return orderedEventList[i];
      }
    }
    return null; // All events are already on the timeline
  };


  // calculate the index of the draggable event based on its y position
  const getFullTimelineIncludingProspectiveEvent = () => {
    if (
      timelineRef.current &&
      typeof timelineRef.current.offsetLeft === 'number' &&
      typeof timelineRef.current.offsetWidth === 'number' &&
      (draggablePosition.x - (timelineRef.current.offsetLeft + timelineRef.current.offsetWidth / 2)) > 20
    ) {
      return fixedEvents;
    }

    const nextEvent = getNextAvailableEvent();
    if (!nextEvent) return fixedEvents;

    const index = Math.floor((draggablePosition.y - baseY) / eventSpacing);
    const prospectiveEvent = {
      label: nextEvent.label,
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
    // Only allow adding if there is a next available event
    const nextEvent = getNextAvailableEvent();
    if (!nextEvent) {
      setDraggablePosition({ x: 0, y: 0 });
      return;
    }
    const index = Math.floor((data.y - baseY) / eventSpacing);
    const newEvent = {
      label: nextEvent.label,
      y: data.y,
    };
    const fullTimeline = [...fixedEvents];
    if (index >= 0 && index < fullTimeline.length) {
      fullTimeline.splice(index, 0, newEvent);
    } else if (index === fullTimeline.length) {
      fullTimeline.push(newEvent);
    }

    // Check if the new timeline is in the correct order
    const timelineLabels = fullTimeline.map(ev => ev.label);
    const orderedLabels = orderedEventList.map(ev => ev.label);
    let isCorrectOrder = true;
    for (let i = 0; i < timelineLabels.length; i++) {
      if (timelineLabels[i] !== orderedLabels[i]) {
        isCorrectOrder = false;
        break;
      }
    }
    if (!isCorrectOrder) {
      // Reject placement and do not update timeline
      alert('The new event was placed in an incorrect order!');
      setDraggablePosition({ x: 0, y: 0 });
      return;
    }

    setFixedEvents(fullTimeline);
    setDraggablePosition({ x: 0, y: 0 });
    setBaseY(timelineRef.current.offsetHeight / 2 - eventSpacing * (fullTimeline.length) / 2);
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
            {getNextAvailableEvent() ? `Drag: ${getNextAvailableEvent().label}` : 'All events placed!'}
          </div>
        </Draggable>
      </div>
    </div>
  );
}

export default App;
