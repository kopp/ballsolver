import React, { useState, useEffect } from "react";
import { Color, getMarbleViolations, aStarSearch } from "./solver";

// Create a dropdown for each hole and a button to start the solver.
const PuzzleSolver: React.FC = () => {
  // State to store the initial marble positions
  const [marbles, setMarbles] = useState<Color[]>(
    Array.from({ length: 11 }, (_, i) => i as Color)
  );

  // the validitiy of the current marble setting
  const violations = getMarbleViolations(marbles);

  // state to store a computed result
  const [solution, setSolution] = useState<string[] | null>(null);

  // If new marbles are set, then invalidate the current solution
  useEffect(() => setSolution(null), [marbles]);

  // Handle dropdown change for marbles
  const handleMarbleChange = (index: number, color: Color) => {
    const newMarbles = [...marbles];
    newMarbles[index] = color;
    setMarbles(newMarbles);
  };

  // Handle starting of the solver
  const startSolver = () => {
    const result = aStarSearch(marbles);
    setSolution(result);
  };

  return (
    <div>
      <h1>Puzzle Solver</h1>
      <div>
        <h2>Set the problem</h2>
        {marbles.map((marble, index) => (
          <div key={index}>
            <label>
              Marbel {Color[index]} is in hole{" "}
              <select
                value={marble}
                onChange={(e) =>
                  handleMarbleChange(index, Number(e.target.value) as Color)
                }
              >
                {Object.keys(Color)
                  .filter((key) => isNaN(Number(key)))
                  .map((key) => (
                    <option
                      key={Color[key as keyof typeof Color]}
                      value={Color[key as keyof typeof Color]}
                    >
                      {key}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        ))}
      </div>
      <p> </p>
      {violations.length === 0 ? (
        <div>
          <button onClick={startSolver}>Solve It</button>
        </div>
      ) : (
        <div>
          <p>Input is invalid:</p>
          <ul>
            {violations.map((violation, index) => (
              <li key={index}>{violation}</li>
            ))}
          </ul>
        </div>
      )}
      {solution && (
        <div>
          <h2>Solution Steps:</h2>
          {solution.length > 0 ? (
            <ol>
              {solution.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          ) : (
            <p>No steps necessary -- looks good already</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PuzzleSolver;
