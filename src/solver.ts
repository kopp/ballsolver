export enum Color {
  Red = 0,
  LightBlue = 1,
  DarkGreen = 2,
  Yellow = 3,
  Purple = 4,
  Orange = 5,
  Black = 6,
  LightGreen = 7,
  DarkBlue = 8,
  Pink = 9,
  Cyan = 10,
  White = 11,
}


type State = {
  marbles: Color[]; // Array of marble positions; value is color of the hole, index is color of the marble
  moves: string[]; // Array to keep track of moves.
  cost: number; // Total cost to reach this state (g-cost).
  heuristic: number; // Estimated cost to the goal (h-cost).
};

// return a list of descriptions of violations of a valid setting of marbles
export function getMarbleViolations(marbles: Color[]): string[] {
  const violations: string[] = [];
  // every hole can hold exactly one marble
  const occurences = marbles.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
  for (let [holeColor, occurence] of occurences.entries()) {
    if (occurence > 1) {
      marbles.forEach((holeColor2, marbleColorNum) => {
        if (holeColor === holeColor2) {
          violations.push(`Marble ${Color[marbleColorNum as Color]} shares the hole ${Color[holeColor]} with ${occurence - 1} more marbles.`);
        }
      })
    }
  }
  return violations;
}

export function getEmptyHole(marbles: Color[]): Color {
    const unaccountedHoles = new Set(Object.values(Color).filter(v => typeof v === 'number')) as Set<Color>;
    marbles.forEach(holeContainingMarble => unaccountedHoles.delete(holeContainingMarble));
    if (unaccountedHoles.size == 1) {
        const [only] = unaccountedHoles;
        return only;
    }
    else {
        throw new Error(`Unable to derive empty hole for marbles ${marbles}; kept ${unaccountedHoles}`)
    }
}

// neighbors of each hole in an adjacency list format.
const neighbors: Record<Color, Color[]> = {
  [Color.Red]: [Color.LightBlue, Color.DarkGreen,Color.Purple, Color.Cyan, Color.White],
  [Color.LightBlue]: [Color.Red, Color.White, Color.Black, Color.LightGreen, Color.DarkGreen],
  [Color.DarkGreen]: [Color.Red, Color.LightBlue, Color.LightGreen, Color.DarkBlue, Color.DarkBlue, Color.Purple],
  [Color.Yellow]: [Color.Pink, Color.Orange, Color.Black, Color.White, Color.Cyan],
  [Color.Purple]: [Color.Red, Color.DarkGreen, Color.DarkBlue, Color.Pink, Color.Cyan],
  [Color.Orange]: [Color.Black, Color.Yellow, Color.Pink, Color.DarkBlue, Color.LightGreen],
  [Color.Black]: [Color.LightBlue, Color.White, Color.Yellow, Color.Orange, Color.LightGreen],
  [Color.LightGreen]: [Color.LightBlue, Color.Black, Color.Orange, Color.DarkBlue, Color.DarkGreen],
  [Color.DarkBlue]: [Color.Pink, Color.Purple, Color.DarkGreen, Color.LightGreen, Color.Orange],
  [Color.Pink]: [Color.Yellow, Color.Cyan, Color.Purple, Color.DarkBlue, Color.Orange],
  [Color.Cyan]: [Color.Yellow, Color.White, Color.Red, Color.Purple, Color.Pink],
  [Color.White]: [Color.LightBlue, Color.Red, Color.Cyan, Color.Yellow, Color.Black],
};

// Function to compute the heuristic (h-cost) of a state
function computeHeuristic(marbles: Color[]): number {
  return marbles.reduce(
    (sum, marble, index) => sum + (marble !== index ? 1 : 0),
    0
  );
}

// Function to generate valid moves from a given state.
function generateMoves(state: State): State[] {
  const emptyHole = getEmptyHole(state.marbles);

  const newStates: State[] = [];

  // Iterate over all neighbors of the empty hole.
  for (const neighbor of neighbors[emptyHole]) {
    const marbleIndex = state.marbles.findIndex((marble) => marble === neighbor);
    if (marbleIndex !== -1) {
      // Create a new state with the moved marble.
      const newMarbles = [...state.marbles];
      newMarbles[marbleIndex] = emptyHole; // Move marble to empty hole.
      const newState: State = {
        marbles: newMarbles,
        moves: [...state.moves, `Move marble ${Color[marbleIndex as Color]} from ${Color[neighbor]} to ${Color[emptyHole]}.`],
        cost: state.cost + 1,
        heuristic: computeHeuristic(newMarbles),
      };
      newStates.push(newState);
    }
  }

  return newStates;
}

function getStateHash(state: State): string {
  return JSON.stringify(state.marbles);
}

// A* search function to find the optimal path to the goal state.
export function aStarSearch(initialMarbles: Color[]): string[] | null {

  const violations = getMarbleViolations(initialMarbles);
  if (violations.length !== 0) {
    throw new Error(`Invalid input: ${JSON.stringify(violations)}`);
  }

  const initialState: State = {
    marbles: initialMarbles,
    moves: [],
    cost: 0,
    heuristic: 0,
  };

  initialState.heuristic = computeHeuristic(initialState.marbles);

  const openSet: State[] = [initialState];
  const closedSet: Set<string> = new Set();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.cost + a.heuristic - (b.cost + b.heuristic));
    const currentState = openSet.shift()!;

    if (computeHeuristic(currentState.marbles) === 0) {
      return currentState.moves;
    }

    closedSet.add(getStateHash(currentState));

    for (const neighbor of generateMoves(currentState)) {
      if (!closedSet.has(getStateHash(neighbor))) {
        openSet.push(neighbor);
      }
    }
  }

  return null; // No solution found.
}
