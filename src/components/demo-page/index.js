import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import DimensionsProvider from '../DimensionsProvider';
import SoundfontProvider from '../SoundfontProvider';
import { Carousel, Item, Button } from 'react-bootstrap';
import NavBarComponent from '../navbar';
import Circle from '../circle';
import RadioBtns from '../radio-btns'


import './style.css';

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

const noteRange = {
  first: MidiNumbers.fromNote('c3'),
  last: MidiNumbers.fromNote('c5'),
};
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

const CreateDemoPage = (props) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeNote, setActiveNote] = useState(null)
  const [infoBox, setInfoBox] = useState("Testing")
  const [gameState, setGameState] = useState(-1)
  const [scaleState, setScaleState] = useState(0)
  const [gameDisable, setGameDisable] = useState(true)
  const [radioState11, setRadioState11] = useState("3")
  const [radioState22, setRadioState22] = useState("1")
  const [scaleStartingNotes, setScaleStartingNotes] = useState([48, 55, 50, 57, 52, 59, 54, 49, 56, 51, 58, 53])

  const correctNote = ["Great!", "Keep going!", "You got this!", "Wow!", "Sounds good!", "Fantastic!"]

  var tempGameState = gameState
  console.log("It rerendered")
  console.log("temp:  " + tempGameState)
  console.log("gamestate:  " + gameState)

  //newscale starting notes-- cycle
  const sharpScaleStartingNotes = [
    48, 55, 50, 57, 52, 59, 54, 49, 56, 51, 58, 53
  ]
  const flatScaleStartingNotes = [
    53, 58, 51, 56, 59, 54, 59, 52, 57, 50, 55, 48
  ]

  const majorScalePattern = [
    0, 2, 4, 5, 7, 9, 11, 12
  ]

  //Changes state from radio buttons
  const radioStateChange = (radioState1, radioState2) => {
    setRadioState11(radioState1)
    setRadioState22(radioState2)
  }

  //Advances Slide
  const handleButtonClick = (e) => {
    triggerNewSlide()
  }
  const triggerNewSlide = (e) => {
    setSlideIndex(slideIndex + 1)
  }

  //Plays the scales
  const playScale = (e) => {
    if (!gameDisable) {
      setGameDisable(true)
    }
    if (radioState22 === "1") {
      setScaleStartingNotes(sharpScaleStartingNotes)
    }
    if (radioState22 === "2") {
      setScaleStartingNotes(flatScaleStartingNotes)
    }
    setInfoBox("Listen")
    setTimeout(function () {
      setGameDisable(false)
      setInfoBox("Now you try!")
    }, 8035)
    console.log("current game state of playScale:  " + tempGameState)
    console.log("actual state variable:  " + gameState)
    setTimeout(function () {
      setActiveNote(null)
    }, 8000)
    majorScalePattern.map(
      function (currentValue, index) {
        setTimeout(
          function () {
            var activeNoteArray = []
            console.log("looking at data:  ", scaleStartingNotes)
            activeNoteArray.push(scaleStartingNotes[tempGameState] + currentValue)
            setActiveNote(activeNoteArray)
          }, (1000 * index)
        )
      }
    )
  }

  //Takes Keyboard input while game is active
  var recordedArray = []
  const recordNote = (midiNumber) => {
    if (!gameDisable) {
      if (midiNumber == scaleStartingNotes[tempGameState] + majorScalePattern[scaleState]) {
        setScaleState(scaleState + 1)
        var displayPat = correctNote[Math.floor(Math.random() * correctNote.length)]
        setInfoBox(displayPat)
        if (scaleState == 7) {
          setGameDisable(true)
          setInfoBox("Wow great job!  Onto the next scale...")
          setTimeout(function () {
            setScaleState(0)
            tempGameState++
            setGameState(gameState + 1)
            triggerNewSlide()
            playScale()
          }, 1500)
        }
      }
      else {
        console.log("midinumber: ", midiNumber)
        console.log("scaleStartingNotes:  ", scaleStartingNotes)
        console.log("tempGameState:  ", tempGameState)
        console.log("majorscalepattern[scalestate]:  ", majorScalePattern[scaleState])
        setInfoBox("Oops!")
        setGameDisable(true)
        setTimeout(function () {
          setScaleState(0)
          setTimeout(function () {
            scaleGame()
          }, 1000)
        }, 1500)
      }
    }
    recordedArray.push(midiNumber)
    console.log(recordedArray)
  }

  //Starts game from button click
  const startGameButton = () => {
    tempGameState++
    setGameState(tempGameState)
    scaleGame()
  }

  //Demos a scale and waits for response
  function scaleGame() {
    playScale()
  }

  return (<>
    <NavBarComponent />
    <div className="charts col-md-6">
      <Circle />
    </div>
    <button onClick={handleButtonClick}>Advance Slide</button>
    <button onClick={function () { console.log(radioState11, radioState22) }/*playScale*/}>Play Scale</button>
    <button onClick={startGameButton}>Start Game</button>
    <p id="infoBox" className="col-md-6">{infoBox}</p>
    < RadioBtns radioStateChange={radioStateChange} />

    <div className="wrapper">
      <DimensionsProvider>
        {({ containerWidth, containerHeight }) => (
          <SoundfontProvider
            instrumentName="acoustic_grand_piano"
            audioContext={audioContext}
            hostname={soundfontHostname}
            render={({ isLoading, playNote, stopNote }) => (
              <Piano
                noteRange={noteRange}
                width={containerWidth}
                playNote={playNote}
                stopNote={stopNote}
                disabled={isLoading}
                activeNotes={activeNote}
                keyboardShortcuts={keyboardShortcuts}
                onPlayNoteInput={recordNote}
                {...props}
              />
            )}
          />
        )}
      </DimensionsProvider>
    </div>
  </>
  );
}

export default CreateDemoPage
