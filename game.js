const boardSize = 10; // Cambiado a 10x10
const ships = [
  { size: 2, positions: [], hits: 0 }, // Barco de 2 casillas
  { size: 2, positions: [], hits: 0 }, // Barco de 2 casillas
  { size: 3, positions: [], hits: 0 }, // Barco de 3 casillas
  { size: 3, positions: [], hits: 0 }, // Barco de 3 casillas
  { size: 4, positions: [], hits: 0 }, // Barco de 4 casillas
  { size: 5, positions: [], hits: 0 }, // Barco de 5 casillas
];
let playerBoard = [];
let enemyBoard = [];
let playerShips = [];
let enemyShips = [];
let gameOver = false;

// Inicializamos la flota
function initializeBoards() {
  for (let i = 0; i < boardSize; i++) {
    playerBoard.push(new Array(boardSize).fill(null));
    enemyBoard.push(new Array(boardSize).fill(null));
  }
}

//////
function showTurnModal(message, callback) {
  // Crear elementos del modal
  const modal = document.createElement('div');
  const modalContent = document.createElement('div');
  const modalMessage = document.createElement('p');
  const closeButton = document.createElement('button');

  // Configuración de estilos y clases
  modal.className = 'modal';
  modalContent.className = 'modal-content';
  modalMessage.textContent = message;
  closeButton.textContent = 'Continuar';
  closeButton.className = 'modal-button';

  // Añadir evento al botón
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
    if (callback) callback(); // Ejecutar el callback después de cerrar el modal
  });

  // Construir el modal
  modalContent.appendChild(modalMessage);
  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}


////////

// ubicación aleatoria de los barcos
function placeShips(board, ships, isPlayer) {
  ships.forEach(ship => {
    let placed = false;
    while (!placed) {
      const isHorizontal = Math.random() < 0.5;
      const x = Math.floor(Math.random() * (isHorizontal ? boardSize : boardSize - ship.size + 1));
      const y = Math.floor(Math.random() * (isHorizontal ? boardSize - ship.size + 1 : boardSize));

      // checkeamos si los barcos se pueden posicionar
      if (canPlaceShip(board, x, y, ship.size, isHorizontal)) {
        placeShip(board, ship, x, y, isHorizontal);
        placed = true;
        if (isPlayer) playerShips.push(ship);
        else enemyShips.push(ship);
      }
    }
  });
}

// checkeamos si los barcos se pueden posicionar
function canPlaceShip(board, x, y, size, isHorizontal) {
  for (let i = -1; i <= size; i++) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const checkX = isHorizontal ? x + dx : x + i + dx;
        const checkY = isHorizontal ? y + i + dy : y + dy;

        //checkeamos si hay barcos cerca
        if (
          checkX >= 0 && checkX < boardSize &&
          checkY >= 0 && checkY < boardSize &&
          board[checkX][checkY] !== null
        ) {
          return false; // Casilla ocupada o adyacente
        }
      }
    }
  }
  return true;
}

// sitio de los barcos en la flota
function placeShip(board, ship, x, y, isHorizontal) {
  ship.isHorizontal = isHorizontal; // Guardar orientación del barco
  for (let i = 0; i < ship.size; i++) {
    const placeX = isHorizontal ? x : x + i;
    const placeY = isHorizontal ? y + i : y;
    board[placeX][placeY] = 'S'; // S para los barcos
    ship.positions.push({ x: placeX, y: placeY });

    if (isHorizontal && i === 0) {
      ship.positions[0].isStart = true; // Marca la celda inicial
    }

    if (isHorizontal && i === ship.size - 1) {
      ship.positions[i].isEnd = true; // Marca la celda final
    }
    // Marca la primera celda para barcos verticales
    if (!isHorizontal && i === 0) {
      ship.positions[0].isStart = true; // Marca la celda inicial
    }
    // Marca la última celda para barcos verticales
    if (!isHorizontal && i === ship.size - 1) {
      ship.positions[i].isEnd = true; // Marca la celda final
    }
  }

}

// Renderizamos los barcos
function renderBoards() {
  renderBoard('player-board', playerBoard, false);
  renderBoard('enemy-board', enemyBoard, true);
}

function renderBoard(boardId, boardData, isEnemy) {
  const board = document.getElementById(boardId);
  board.innerHTML = '';

  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;

      // mostramos los barcos en la flota del jugador
      if (!isEnemy && boardData[x][y] === 'S') {
        cell.classList.add('ship');

        // Diferenciar orientación del barco
        const ship = findShipAtPosition(playerShips, x, y);

        if (ship) {
          if (ship.isHorizontal) {
            cell.classList.add('horizontal-ship');
            //inicio de ,los barcos marcados 
            const isStart = ship.positions.some(pos => pos.x === x && pos.y === y && pos.isStart);
            if (isStart) {
              cell.classList.add('start');
            }
            //Fin de los barcos marcados
            const isEnd = ship.positions.some(pos => pos.x === x && pos.y === y && pos.isEnd);
            if (isEnd) {
              cell.classList.add('end');
            }

          } else {
            cell.classList.add('vertical-ship');
            //inicio de ,los barcos marcados 
            const isStart = ship.positions.some(pos => pos.x === x && pos.y === y && pos.isStart);
            if (isStart) {
              cell.classList.add('start');
            }
            //Fin de los barcos marcados
            const isEnd = ship.positions.some(pos => pos.x === x && pos.y === y && pos.isEnd);
            if (isEnd) {
              cell.classList.add('end');
            }
          }
        }


      }

      if (isEnemy) {
        cell.addEventListener('click', () => handlePlayerMove(x, y));
      }

      board.appendChild(cell);
    }
  }
}


// Función para encontrar el barco en una posición dada
function findShipAtPosition(ships, x, y) {
  return ships.find(ship =>
    ship.positions.some(pos => pos.x === x && pos.y === y)
  );
}

let playerTurn = true; // Comienza siendo el turno del jugador
// handle del movimiento del jugador

function handlePlayerMove(x, y) {
  if (!playerTurn || gameOver) return; // Bloquea el turno si no es del jugad

  const cell = document.querySelector(`#enemy-board .cell[data-x="${x}"][data-y="${y}"]`);
  if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

  if (enemyBoard[x][y] === 'S') {
    cell.classList.add('hit');
    enemyBoard[x][y] = 'H'; // H para tocado
    const hitShip = enemyShips.find(ship =>
      ship.positions.some(pos => pos.x === x && pos.y === y)
    );
    hitShip.hits++;

    if (hitShip.hits === hitShip.size) {
      updateStatus(`¡Hundiste un barco enemigo de tamaño ${hitShip.size}!`);
      showTurnModal(`¡Hundiste un barco enemigo de tamaño ${hitShip.size}!`, () => {
        checkWin();
        if (!gameOver){
          playerTurn = false; // Deshabilitar el turno del jugador
          machineMove();
        }
      });
    } else {
      updateStatus('¡Tocado!');
      showTurnModal('¡Tocado!', () => {
        checkWin();
        if (!gameOver) {
          playerTurn = false; // Deshabilitar el turno del jugador
          machineMove();
        }
      });
    }
  } else {
    cell.classList.add('miss');
    updateStatus('¡Agua!');
    showTurnModal('¡Agua!', () => {
      checkWin();
      if (!gameOver){
        playerTurn = false; // Deshabilitar el turno del jugador
        machineMove();
      }
    });
  }
}

//movimiento random de la maquina
function machineMove() {
  let x, y;
  do {
    x = Math.floor(Math.random() * boardSize);
    y = Math.floor(Math.random() * boardSize);
  } while (playerBoard[x][y] === 'H' || playerBoard[x][y] === 'M');

  setTimeout(() => {
    const cell = document.querySelector(`#player-board .cell[data-x="${x}"][data-y="${y}"]`);
    if (playerBoard[x][y] === 'S') {
      cell.classList.add('hit');
      playerBoard[x][y] = 'H';
      const hitShip = playerShips.find(ship =>
        ship.positions.some(pos => pos.x === x && pos.y === y)
      );
      hitShip.hits++;

      if (hitShip.hits === hitShip.size) {
        updateStatus(`¡La máquina hundió tu barco de tamaño ${hitShip.size}!`);
        showTurnModal(`¡La máquina hundió tu barco de tamaño ${hitShip.size}!`, () => {
          checkWin();
          if (!gameOver) playerTurn = true; // Habilita el turno del jugador
        });
      } else {
        updateStatus('La máquina acertó el disparo.');
        showTurnModal('La máquina acertó el disparo.', () => {
          checkWin();
          if (!gameOver) playerTurn = true; // Habilita el turno del jugador
        });
      }
    } else {
      cell.classList.add('miss');
      updateStatus('La máquina falló.');
      showTurnModal('La máquina falló.', () => {
        checkWin();
        if (!gameOver) playerTurn = true; // Habilita el turno del jugador
      });
    }
  }, 3000);
}


// Checkeamos si hemos perdido
function checkWin() {
  const allEnemyShipsHit = enemyShips.every(ship =>
    ship.positions.every(pos => enemyBoard[pos.x][pos.y] === 'H')
  );
  const allPlayerShipsHit = playerShips.every(ship =>
    ship.positions.every(pos => playerBoard[pos.x][pos.y] === 'H')
  );

  if (allEnemyShipsHit) {
    updateStatus('¡Has ganado!');
    gameOver = true;
  } else if (allPlayerShipsHit) {
    updateStatus('¡La máquina ha ganado!');
    gameOver = true;
  }
}

// actualizamos el status
function updateStatus(message) {
  document.getElementById('status').textContent = message;
}

// inicializamos el juego
function initGame() {
  initializeBoards();
  placeShips(playerBoard, JSON.parse(JSON.stringify(ships)), true);
  placeShips(enemyBoard, JSON.parse(JSON.stringify(ships)), false);
  renderBoards();
}

initGame();
