// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import CompletionModal from '../components/CompletionModal';
import EventListSelector from '../components/EventListSelector';
import { useParams, useNavigate } from 'react-router-dom';

// Type for event objects
/**
 * @typedef {{ label: string, [key: string]: any }} EventObj
 */

export default function MainTimelineApp() {
  const { eventListId } = useParams();
  const navigate = useNavigate();
  const [showCompletion, setShowCompletion] = useState(false);
  const [eventListManifest, setEventListManifest] = useState(null);
  const [selectedEventList, setSelectedEventList] = useState(/** @type {string|null} */(null));
  const [orderedEventList, setOrderedEventList] = useState(/** @type {EventObj[]} */([]));
  const [fixedEvents, setFixedEvents] = useState(/** @type {EventObj[]} */([]));
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/eventListManifest.json')
      .then(res => res.json())
      .then(data => setEventListManifest(data));
  }, []);
  useEffect(() => {
    if (eventListId) {
      setSelectedEventList(eventListId);
    }
  }, [eventListId]);
  useEffect(() => {
    if (selectedEventList) {
      fetch(process.env.PUBLIC_URL + '/' + selectedEventList)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrderedEventList(data);
            setFixedEvents([]);
          } else {
            setOrderedEventList(data.events || []);
            setFixedEvents(data.fixed || []);
          }
        });
    }
  }, [selectedEventList]);
  const TOP_SPACER = 100;
  const timelineRef = useRef(null);
  const [baseY, setBaseY] = useState(TOP_SPACER);
  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
  const draggableRef = useRef(null);
  const eventSpacing = 70;
  useEffect(() => {
    setBaseY(TOP_SPACER);
  }, [fixedEvents.length]);
  const getRandomAvailableEvent = () => {
    const timelineLabels = fixedEvents.map(ev => ev.label);
    const available = orderedEventList.filter(ev => !timelineLabels.includes(ev.label));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  };
  const [currentRandomEvent, setCurrentRandomEvent] = useState(null);

  // Abstracted function to add an event to the timeline with validation
  const addEventToTimeline = (newEvent, index) => {
    const fullTimeline = [...fixedEvents];
    fullTimeline.splice(index, 0, newEvent);
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
      alert('Placing this event would be out of order!');
      return false;
    }
    setFixedEvents(fullTimeline);

    // check to see if we filled the timeline, can't use length because duplicates are possible, instead check to see if any available events remain
    const available = orderedEventList.filter(ev => !fullTimeline.map(e => e.label).includes(ev.label));
    if (available.length === 0) {
      setShowCompletion(true);
      console.log('Timeline complete!');
    } else {
      console.log("Timeline not complete yet, available events remain.", available);
    }

    return true;
  };

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
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
        if (!currentRandomEvent) return;
        const orderedLabels = orderedEventList.map(ev => ev.label);
        let correctIdx = 0;
        for (; correctIdx < fixedEvents.length; correctIdx++) {
          const idxInOrdered = orderedLabels.indexOf(fixedEvents[correctIdx].label);
          const randomIdx = orderedLabels.indexOf(currentRandomEvent.label);
          if (randomIdx < idxInOrdered) break;
        }
        const newEvent = { label: currentRandomEvent.label };
        const success = addEventToTimeline(newEvent, correctIdx);
        if (success) {
          setBaseY(timelineRef.current ? timelineRef.current.offsetHeight / 2 - eventSpacing * (fixedEvents.length) / 2 : 0);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRandomEvent, fixedEvents, setFixedEvents, orderedEventList, timelineRef, eventSpacing, setBaseY]);
  if (eventListManifest && !selectedEventList) {
    return <EventListSelector manifest={eventListManifest} onSelect={setSelectedEventList} />;
  }
  const getFullTimelineIncludingProspectiveEvent = () => {
    // Only show the preview if the draggable is being held
    if (draggablePosition.x === 0 && draggablePosition.y === 0) {
      return fixedEvents;
    }
    const fullTimeline = [...fixedEvents];
    const scrollTop = timelineRef.current ? timelineRef.current.scrollTop : 0;
    const adjustedY = draggablePosition.y + scrollTop;
    let index = fullTimeline.length;
    for (let i = 0; i < fullTimeline.length; i++) {
      const eventCenterY = TOP_SPACER + i * eventSpacing + eventSpacing / 2;
      if (adjustedY < eventCenterY) {
        index = i;
        break;
      }
    }
    const nextEvent = currentRandomEvent;
    if (!nextEvent) return fixedEvents;
    const prospectiveEvent = {
      label: nextEvent.label,
      type: 'prospective',
      y: adjustedY,
    };
    fullTimeline.splice(index, 0, prospectiveEvent);
    return fullTimeline;
  };
  const handleStop = (e, data) => {
    const nextEvent = currentRandomEvent;
    if (!nextEvent) {
      setDraggablePosition({ x: 0, y: 0 });
      return;
    }
    if (timelineRef.current) {
      const dragX = data.x;
      if (dragX > 0) {
        setDraggablePosition({ x: 0, y: 0 });
        return;
      }
    }
    const scrollTop = timelineRef.current ? timelineRef.current.scrollTop : 0;
    const adjustedY = data.y + scrollTop;
    let index = fixedEvents.length;
    for (let i = 0; i < fixedEvents.length; i++) {
      const eventCenterY = TOP_SPACER + i * eventSpacing + eventSpacing / 2;
      if (adjustedY < eventCenterY) {
        index = i;
        break;
      }
    }
    const newEvent = {
      label: nextEvent.label,
      y: adjustedY,
    };
    const success = addEventToTimeline(newEvent, index);
    setDraggablePosition({ x: 0, y: 0 });
    if (success) {
      setBaseY(timelineRef.current ? timelineRef.current.offsetHeight / 2 - eventSpacing * (fixedEvents.length) / 2 : 0);
    }
  };
  const timelineInfo = eventListManifest?.find(item => item.filename === selectedEventList);
  const timelineName = timelineInfo?.name || 'Untitled Timeline';
  return (
    <>
      {/* Always render the modal, but only show it when showCompletion is true */}
      {showCompletion && <CompletionModal onClose={() => navigate('/')} show={showCompletion} />}
      <div className="App" style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <header style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--polynesian-blue)', color: 'white', position: 'relative' }}>
            <button onClick={() => navigate('/')} aria-label="Back" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1>{timelineName}</h1>
          </header>
          <main
            style={{
              position: 'relative',
              height: '100%',
              minHeight: 0,
              overflow: 'auto',
              maxHeight: 'calc(100vh - 80px)',
              borderRight: '1px solid #eee',
            }}
            ref={timelineRef}
          >
            <div
              style={{
                position: 'relative',
                minHeight: `${(fixedEvents.length + 1) * eventSpacing + 300}px`,
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
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
