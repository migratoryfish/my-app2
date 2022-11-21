import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props){
  return (
    <button
     className={'square' + (props.causedWin ? ' caused-win': '')}
     onClick={() => props.onClick()}>
      {props.value}
    </button>
  );
}
  
class Board extends React.Component {

  renderSquare(i, causedWin) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)} 
        key = {i}
        causedWin={causedWin}
        />
    );
  }

  render() {
    const rows = [0, 1, 2];
    const cols = [0, 1, 2];
    return (
      <div>
        {rows.map(row => {
          return(
            <div className="board-row" key={row}>
              {cols.map(col => {
                const cell = row * cols.length + col;
                const causedWin = this.props.winnerLines.includes(cell);
                return this.renderSquare(cell, causedWin);
              })}
            </div>
          );
        })}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        startCoordinates : {
          row: 0,
          col: 0,
        },
      }],
      stepNumber: 0,
      xIsNext: true,
      isAsc : true,
    };
  }

  handleClick(i){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X': 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        startCoordinates : {
          row: Math.trunc(i / 3),
          col: i % 3,
        },
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  ascDescToggle(isAsc){
    this.setState({
      isAsc : !isAsc,
    });
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.isAsc ? this.state.history : [...this.state.history].reverse();
    const currentStepNumber = this.state.isAsc ? this.state.stepNumber : history.length - 1 - this.state.stepNumber;
    const currentHistory = history[currentStepNumber];
    const winnerInfo  = calculateWinner(currentHistory.squares);

    const moves = history.map((step, move) => {
      const moveIndex = this.state.isAsc ? move : history.length - 1 - move;
      const desc = moveIndex ?
        'Go to move ' + 'row: ' + step.startCoordinates.row + ' col: '+ step.startCoordinates.col :
        'Go to game start';

      return(
        <li key={moveIndex}>
          <button
          onClick={() => this.jumpTo(moveIndex)}
          className={move == currentStepNumber ? 'history-button': ''}
          >
            {desc}
            </button>
        </li>
      );

    });

    let status;
    if(winnerInfo.winner){
      status = 'Winner: ' + winnerInfo.winner;
    }else if(winnerInfo.isDraw){
      status = 'draw this match'
    }else{
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O')
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={currentHistory.squares}
            onClick={(i) => this.handleClick(i)}
            winnerLines={winnerInfo.winnerLines}
           />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button
           onClick={() => this.ascDescToggle(this.state.isAsc)}>
            {this.state.isAsc ? "ASC" : "DESC"}
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner : squares[a],
        winnerLines : lines[i],
        isDraw : false,
      };
    }
  }
  return {
    winner : null,
    winnerLines : [],
    isDraw : squares.at(-1) !== null ? true : false,
  };

}