import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import axios from "axios";

const Joystick = () => {
  const [direction, setDirection] = useState(null);
  const [Stop, setStop] = useState(null);
  const handleButtonPress = (dir) => {
    setDirection(dir);
    setStop("");
  };

  const handleButtonRelease = () => {
    setDirection(null);
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "Shift":
        setStop("Stop");
        break;
      case "ArrowUp":
        setDirection("up");
        setStop("");

        break;
      case "ArrowDown":
        setDirection("down");
        setStop("");
        break;
      case "ArrowLeft":
        setDirection("left");
        setStop("");

        break;
      case "ArrowRight":
        setDirection("right");
        setStop("");

        break;
      default:
        break;
    }
  };

  const handleKeyUp = () => {
    setDirection(null);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  useMemo(() => {
    axios
      .put("https://robot-data.onrender.com/data/direction/1", {
        direction: direction?.toUpperCase(),
      })
      .then((response) => console.log("updating direction"))
      .catch((error) => console.error(error));
  }, [direction]);
  useMemo(() => {
    if (Stop) {
      axios
        .put("https://robot-data.onrender.com/data/direction/1", {
          direction: Stop?.toUpperCase(),
        })
        .then((response) => console.log("updating Status"))
        .catch((error) => console.error(error));
    }
  }, [Stop]);
  return (
    <div className="joystick-container">
      <button
        className={`joystick-button ${direction === "up" ? "active" : ""}`}
        onTouchStart={() => handleButtonPress("up")}
        onTouchEnd={handleButtonRelease}
        onMouseDown={() => handleButtonPress("up")}
        onMouseUp={handleButtonRelease}
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
      <div style={{ display: "flex", gap: "0px" }}>
        <button
          className={`joystick-button ${direction === "left" ? "active" : ""}`}
          onTouchStart={() => handleButtonPress("left")}
          onTouchEnd={handleButtonRelease}
          onMouseDown={() => handleButtonPress("left")}
          onMouseUp={handleButtonRelease}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button className="stop-button" onClick={() => setStop("Stop")}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <button
          className={`joystick-button ${direction === "right" ? "active" : ""}`}
          onTouchStart={() => handleButtonPress("right")}
          onTouchEnd={handleButtonRelease}
          onMouseDown={() => handleButtonPress("right")}
          onMouseUp={handleButtonRelease}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <button
        className={`joystick-button ${direction === "down" ? "active" : ""}`}
        onTouchStart={() => handleButtonPress("down")}
        onTouchEnd={handleButtonRelease}
        onMouseDown={() => handleButtonPress("down")}
        onMouseUp={handleButtonRelease}
      >
        <FontAwesomeIcon icon={faArrowDown} />
      </button>
    </div>
  );
};

export default Joystick;
