

import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Draggable from 'react-draggable';
import ReactDOM from 'react-dom/client';

// Simple modal for completion
function CompletionModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 16, textAlign: 'center', minWidth: 320 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
        <h2>Congratulations!</h2>
        <p>You placed all events in the correct order.</p>
        <button onClick={onClose} style={{ marginTop: 24, padding: '10px 24px', borderRadius: 8, fontSize: 18, background: '#4caf50', color: 'white', border: 'none', cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  );
}

function usePlaceNextEventHotkey({ getNextAvailableEvent, fixedEvents, setFixedEvents, orderedEventList, timelineRef, eventSpacing, setBaseY }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
        // Place next event at the end if possible
        const nextEvent = getNextAvailableEvent();
        if (!nextEvent) return;
        const fullTimeline = [...fixedEvents, { label: nextEvent.label }];
        // Check if the new timeline is a valid subsequence of the ordered list
        const timelineLabels = fullTimeline.map(ev => ev.label);
        const orderedLabels = orderedEventList.map(ev => ev.label);
        let j = 0;
        let isCorrectOrder = true;
        for (let i = 0; i < timelineLabels.length; i++) {
          while (j < orderedLabels.length && orderedLabels[j] !== timelineLabels[i]) {
            j++;
          }
          if (j === orderedLabels.length) {
            isCorrectOrder = false;
            break;
          }
          j++;
        }
        if (!isCorrectOrder) {
          alert('Placing the next event at the end would be out of order!');
          return;
        }
        setFixedEvents(fullTimeline);
        setBaseY(timelineRef.current && timelineRef.current.offsetHeight ? timelineRef.current.offsetHeight / 2 - eventSpacing * (fullTimeline.length) / 2 : 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getNextAvailableEvent, fixedEvents, setFixedEvents, orderedEventList, timelineRef, eventSpacing, setBaseY]);
}


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

  const [showCompletion, setShowCompletion] = useState(false);
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



  // Consistent top spacer for timeline
  const TOP_SPACER = 100;
  /** @type {React.RefObject<HTMLDivElement>} */
  const timelineRef = useRef(null);
  const [baseY, setBaseY] = useState(TOP_SPACER);
  // Only declare draggable state and ref once
  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
  /** @type {React.RefObject<HTMLDivElement>} */
  const draggableRef = useRef(null);

  const eventSpacing = 70; // Adjust spacing as needed

  // baseY is always the top spacer
  useEffect(() => {
    setBaseY(TOP_SPACER);
  }, [fixedEvents.length]);

  // Map index to Y position on timeline
  const mapIndexToY = (index) => {
    return baseY + index * eventSpacing;
  }



  // Find a random event from the ordered list that is not already on the timeline
  const getRandomAvailableEvent = () => {
    const timelineLabels = fixedEvents.map(ev => ev.label);
    const available = orderedEventList.filter(ev => !timelineLabels.includes(ev.label));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  };

  // Store the current random event to keep it consistent until placed
  /** @type {[EventObj|null, Function]} */
  const [currentRandomEvent, setCurrentRandomEvent] = useState(/** @type {EventObj|null} */(null));

  // Update the random event when fixedEvents or orderedEventList changes
  useEffect(() => {
    const timelineLabels = fixedEvents.map(ev => ev.label);
    const available = orderedEventList.filter(ev => !timelineLabels.includes(ev.label));
    if (available.length === 0) {
      setCurrentRandomEvent(null);
    } else if (!currentRandomEvent || timelineLabels.includes(currentRandomEvent.label)) {
      setCurrentRandomEvent(available[Math.floor(Math.random() * available.length)]);
    }
    // eslint-disable-next-line
  }, [fixedEvents, orderedEventList]);

    // ...existing state and hooks...
    // Register hotkey for placing next event

    // Hotkey for placing the current random event in the correct place
    useEffect(() => {
      const handleKeyDown = (e) => {
        if ((e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
          if (!currentRandomEvent) return;
          // Find the correct index for this event in the timeline
          const timelineLabels = fixedEvents.map(ev => ev.label);
          const orderedLabels = orderedEventList.map(ev => ev.label);
          // Find the index in fixedEvents where this event should go
          let insertIdx = 0;
          let orderedIdx = 0;
          for (; insertIdx < fixedEvents.length; insertIdx++) {
            // Find the next event in orderedLabels that matches fixedEvents[insertIdx]
            while (orderedIdx < orderedLabels.length && orderedLabels[orderedIdx] !== fixedEvents[insertIdx].label) {
              orderedIdx++;
            }
            // If the next event in order is our random event, insert here
            if (orderedIdx < orderedLabels.length && orderedLabels[orderedIdx + 1] === currentRandomEvent.label) {
              insertIdx++;
              break;
            }
          }
          // If not found, place at the end
          if (insertIdx > fixedEvents.length) insertIdx = fixedEvents.length;
          // Actually, we want to insert at the position in orderedLabels
          // Find the correct index in fixedEvents to keep the order
          let correctIdx = 0;
          for (; correctIdx < fixedEvents.length; correctIdx++) {
            const idxInOrdered = orderedLabels.indexOf(fixedEvents[correctIdx].label);
            const randomIdx = orderedLabels.indexOf(currentRandomEvent.label);
            if (randomIdx < idxInOrdered) break;
          }
          const newEvent = { label: currentRandomEvent.label };
          const fullTimeline = [...fixedEvents];
          fullTimeline.splice(correctIdx, 0, newEvent);
          // Check if the new timeline is a valid subsequence of the ordered list
          const newTimelineLabels = fullTimeline.map(ev => ev.label);
          let j = 0;
          let isCorrectOrder = true;
          for (let i = 0; i < newTimelineLabels.length; i++) {
            while (j < orderedLabels.length && orderedLabels[j] !== newTimelineLabels[i]) {
              j++;
            }
            if (j === orderedLabels.length) {
              isCorrectOrder = false;
              break;
            }
            j++;
          }
          if (!isCorrectOrder) {
            alert('Placing this event would be out of order!');
            return;
          }
          setFixedEvents(fullTimeline);
          setBaseY(timelineRef.current && timelineRef.current.offsetHeight ? timelineRef.current.offsetHeight / 2 - eventSpacing * (fullTimeline.length) / 2 : 0);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentRandomEvent, fixedEvents, setFixedEvents, orderedEventList, timelineRef, eventSpacing, setBaseY]);

      // Early return for selector, but after all hooks
  if (eventListManifest && !selectedEventList) {
    return <EventListSelector manifest={eventListManifest} onSelect={setSelectedEventList} />;
  }


  // calculate the index of the draggable event based on its y position
  const getFullTimelineIncludingProspectiveEvent = () => {
    // Only show the preview if the draggable is inside the timeline area
    if (timelineRef.current) {
      const dragX = draggablePosition.x;
      if (dragX > -10) {
        return fixedEvents;
      }
    }

    const nextEvent = currentRandomEvent;
    if (!nextEvent) return fixedEvents;

    // Adjust for scroll position
    const scrollTop = timelineRef.current ? timelineRef.current.scrollTop : 0;
    // Use consistent top spacer
    const adjustedY = draggablePosition.y + scrollTop;
    const index = Math.floor((adjustedY - TOP_SPACER) / eventSpacing);
    const prospectiveEvent = {
      label: nextEvent.label,
      type: 'prospective',
      y: adjustedY,
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
    // Only allow adding if there is a random event
    const nextEvent = currentRandomEvent;
    if (!nextEvent) {
      setDraggablePosition({ x: 0, y: 0 });
      return;
    }
    // Only allow placement if the draggable is in the timeline area
    if (timelineRef.current) {
      const dragX = data.x;
      if (dragX > 0) {
        setDraggablePosition({ x: 0, y: 0 });
        return;
      }
    }
    // Adjust for scroll position
    const scrollTop = timelineRef.current ? timelineRef.current.scrollTop : 0;
    // Use consistent top spacer
    const adjustedY = data.y + scrollTop;
    const index = Math.floor((adjustedY - TOP_SPACER) / eventSpacing);
    const newEvent = {
      label: nextEvent.label,
      y: adjustedY,
    };
    const fullTimeline = [...fixedEvents];
    if (index >= 0 && index < fullTimeline.length) {
      fullTimeline.splice(index, 0, newEvent);
    } else if (index === fullTimeline.length) {
      fullTimeline.push(newEvent);
    }

    // Check if the new timeline is a valid subsequence of the ordered list
    const timelineLabels = fullTimeline.map(ev => ev.label);
    const orderedLabels = orderedEventList.map(ev => ev.label);
    let j = 0;
    let isCorrectOrder = true;
    for (let i = 0; i < timelineLabels.length; i++) {
      while (j < orderedLabels.length && orderedLabels[j] !== timelineLabels[i]) {
        j++;
      }
      if (j === orderedLabels.length) {
        isCorrectOrder = false;
        break;
      }
      j++;
    }
    if (!isCorrectOrder) {
      // Reject placement and do not update timeline
      alert('The new event was placed in an incorrect order!');
      setDraggablePosition({ x: 0, y: 0 });
      return;
    }

    setFixedEvents(fullTimeline);
    setDraggablePosition({ x: 0, y: 0 });
    // baseY is always TOP_SPACER, so no need to update
    // Show modal if all events are placed
    if (!getRandomAvailableEvent()) {
      setShowCompletion(true);
    }
    // console.log("Placed event label:", nextEvent.label);
  }

  return (
    <>
      {showCompletion && <CompletionModal onClose={() => setShowCompletion(false)} />}
      <div className="App" style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ textAlign: 'center', padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
          <h1>Timeline of Events</h1>
        </header>
        {/* Set timeline area to relative for absolute event positioning */}
        <main
          style={{
            position: 'relative',
            height: '100%',
            minHeight: 0,
            overflow: 'auto',
            maxHeight: 'calc(100vh - 80px)', // header height + some margin
            borderRight: '1px solid #eee',
          }}
          ref={timelineRef}
        >
          <div
            style={{
              position: 'relative',
              minHeight: `${(fixedEvents.length + 1) * eventSpacing + 300}px`, // 100px top, 200px bottom
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Top spacer for scrollable margin */}
            <div style={{ height: '100px', pointerEvents: 'none' }} />
            {getFullTimelineIncludingProspectiveEvent().map((event, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: `${TOP_SPACER + index * eventSpacing}px`,
                  left: 'calc(50% - 100px)',
                  width: '200px',
                  padding: '10px',
                  margin: '10px 0',
                  backgroundColor: event.type === 'prospective' ? '#f8d7da' : '#e2e3e5',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  textAlign: 'center',
                  zIndex: event.type === 'prospective' ? 2 : 1,
                }}
              >
                {event.label}
              </div>
            ))}
            {/* Bottom spacer for scrollable margin */}
            <div style={{ height: '200px', pointerEvents: 'none' }} />
          </div>
        </main>
      </div>
      
      <div style={{ width: '200px', padding: '20px', backgroundColor: '#f9f9f9', borderLeft: '1px solid #ccc' }}>
        <h2 style={{ textAlign: 'center' }}>Place Me!</h2>
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
            {currentRandomEvent ? `Drag: ${currentRandomEvent.label}` : 'All events placed!'}
          </div>
        </Draggable>
      </div>
    </div>
    </>
  );
}

export default App;
