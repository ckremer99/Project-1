//-----------------------------Constants--------------------------------//
const numBombs = 3;
const flaggedColor = "66ffff"
const tileColor = "rgb(179, 179, 255)"
const emptyColor = "rgb(163, 163, 194)"
const showColor = "rgb(209, 209, 224)";
const winScreenColor = "rgb(51, 255, 51)"
const winTextColor = "#ffcc00"
const backgroundColor = "#000099"
const titleColor = "#ffffcc"
const loseColor = '#ff9966'
const headingLoseColor = "red"; 
//-----------------------------Variables--------------------------------//
let cells = [];
let bombArr = [];
let win = false; 

let explosionSound = new Audio('sounds/explosion.wav')
let revealSound = new Audio('sounds/reveal_sound.wav')
let flagSound = new Audio('sounds/flag_sound.wav')
let winSound = new Audio('sounds/win_sound.wav')

//----------------------DOM Object initializations----------------------//

const gridArrayElement = document.querySelectorAll(".cell");
const boardElement = document.querySelector("#board");
const resetButtonElement = document.querySelector("#reset");
const titleElement = document.querySelector('h1')
const bodyElement = document.querySelector('body')
const headingElement = document.querySelector('#heading')


//--------------------------Event Listeners------------------------------//

resetButtonElement.addEventListener("click", reset);

for (let i = 0; i < 64; i++) {
    gridArrayElement[i].addEventListener("click", onClick)
}

for (let i = 0; i < 64; i++) {
    gridArrayElement[i].addEventListener("contextmenu", onRightClick);
}


//-------------------------Functions--------------------------------------------------------
function reset(event) {
    clearBoard();

    resetButtonElement.style.animationPlayState = 'paused';

    win = false;
    bombArr = generateBombs();
    for (let idx of bombArr) {
        cells[idx].isMine = true;
    }

    titleElement.textContent = "Welcome to Minesweeper!"
    titleElement.style.color = titleColor;
    bodyElement.style.backgroundImage = "url('images/camo-image.webp')"
    bodyElement.style.backgroundSize = "60%"
    bodyElement.style.backgroundColor = loseColor;


    generateBoard(bombArr);
    render();
}

function onRightClick(event) {
    event.preventDefault();
    idx = Number(event.currentTarget.id);

    if (cells[idx].isHidden) {
        cells[idx].isFlagged = !cells[idx].isFlagged;
        flagSound.play();
    }
    

    if(checkForWin()) {
        winRoutine()
    };
    render();

    return false;
}


function onClick(event) {
    if (win === false) {
        idx = Number(event.currentTarget.id);
        revealCells(idx);
        render();
    }
}

function findNeighbors(index) {
    let y = Math.floor(index / 8);
    let x = index % 8;
    let neighborArr = [];

    if (x === 0) {
        if (y < 7 && y > 0) {
            neighborArr = [
                [y + 1, 0],
                [y - 1, 0],
                [y + 1, 1],
                [y, 1],
                [y - 1, 1],
            ];
        } else if (y === 0) {
            neighborArr = [
                [1, 0],
                [0, 1],
                [1, 1],
            ];
        } else if (y === 7) {
            neighborArr = [
                [7, 1],
                [6, 1],
                [6, 0],
            ];
        }
        return convertCoords(neighborArr);
    }

    if (y === 0) {
        if (x < 7 && x > 0) {
            neighborArr = [
                [0, x + 1],
                [0, x - 1],
                [1, x - 1],
                [1, x],
                [1, x + 1],
            ];
        } else if (x === 7) {
            neighborArr = [
                [0, 6],
                [1, 6],
                [1, 7],
            ];
        }
        return convertCoords(neighborArr);
    }

    if (y === 7) {
        if (x < 7 && x > 0) {
            neighborArr = [
                [7, x + 1],
                [6, x + 1],
                [6, x],
                [7, x - 1],
                [6, x - 1],
            ];
        } else if (x === 7) {
            neighborArr = [
                [7, 6],
                [6, 7],
                [6, 6],
            ];
        }
        return convertCoords(neighborArr);
    }

    if (x === 7) {
        neighborArr = [
            [y - 1, 7],
            [y + 1, 7],
            [y - 1, 6],
            [y + 1, 6],
            [y, 6],
        ];
        return convertCoords(neighborArr);
    }

    neighborArr = [
        [y - 1, x - 1],
        [y, x - 1],
        [y + 1, x - 1],
        [y - 1, x],
        [y + 1, x],
        [y - 1, x + 1],
        [y, x + 1],
        [y + 1, x + 1],
    ];
    return convertCoords(neighborArr);
};

function convertCoords(coordsArray) {
    indices = [];
    for (coord of coordsArray) {
        indices.push(coord[0] * 8 + coord[1]);
    }
    return indices;
};


function render() {
    cells.forEach((cell, idx) => {
    
        if (cell.isFlagged) {
            gridArrayElement[idx].style.backgroundColor = flaggedColor;
            gridArrayElement[idx].textContent = "";
            gridArrayElement[idx].innerHTML = '<i class="fa-solid fa-flag fa-rotate-by fa-lg" style="color: #004fd6; --fa-rotate-angle: 330deg;""></i>'
            return;
        } else {
            gridArrayElement[idx].innerHTML = ""
        }

        if (cell.isHidden) {
            gridArrayElement[idx].style.backgroundColor = tileColor;
            gridArrayElement[idx].innerHTML = "";
            return;
        }

        if (cell.isMine) {
            gridArrayElement[idx].style.backgroundColor = "red";
            gridArrayElement[idx].textContent = "";
            gridArrayElement[idx].innerHTML = '<i class="fa-solid fa-bomb fa-beat"></i>'
            return;
        }

        if (cell.value === 0) {
            gridArrayElement[idx].style.backgroundColor = emptyColor;
        }

        if (cell.value !== 0) {
            gridArrayElement[idx].textContent = cell.value;
            gridArrayElement[idx].style.backgroundColor = showColor;
        }
    });
};

function clearBoard() {
    if (cells.length === 0) {
        for (let i = 0; i < 64; i++) {
            cells.push({
                isMine: false,
                isHidden: true,
                value: 0,
                isFlagged: false,
            });
        }
        return;
    }

    for (let i = 0; i < 64; i++) {
        cells[i].isMine = false;
        cells[i].isHidden = true;
        cells[i].value = 0;
        cells[i].isFlagged = false;
    }
};

function generateBombs(bombArr) {
    let bombs = [];
    bombsLeft = numBombs;
    while (bombsLeft > 0) {
        randomNumber = Math.floor(Math.random() * 64);
        if (bombs.includes(randomNumber)) {
            continue;
        } else {
            bombs.push(randomNumber);
            bombsLeft -= 1;
        }
    }
    return bombs;
};

function generateBoard(bombs) {
    for (let bomb of bombs) {
        neighbors = findNeighbors(bomb);
        for (let neighbor of neighbors) {
            cells[neighbor].value = Number(cells[neighbor].value) + 1;
        }
    }
};

function revealCells(idx) {
    cells[idx].isFlagged = false;
    if (cells[idx].isMine) {
        for (let i = 0; i < 64; i++) {
            cells[i].isHidden = false;
            cells[i].isFlagged = false;
            loseRoutine()
        }
        return;
    } 

    revealSound.play();
    
    if (cells[idx].value === 0) {
        cells[idx].isHidden = false;
        neighbors = findNeighbors(idx);
        let hiddenNeighbors = []
        for (let i = 0; i < neighbors.length; i++) {
            if (cells[neighbors[i]].isHidden === true) {
                hiddenNeighbors.push(neighbors[i])
            }
        }
        for (let i of hiddenNeighbors) {
            revealCells(i);
        }
    }

    if (cells[idx].value !== 0) {
        cells[idx].isHidden = false;
        return;
    }

};


function checkForWin() {
    let markedArr = [];
    cells.forEach((cell, index) => {
        if (cell.isFlagged) {
            markedArr.push(index)
        }
    })
    markedArr.sort()
    bombArr.sort()

    for (let i = 0; i < Math.max(bombArr.length, markedArr.length); i++) {
        if (bombArr[i] !== markedArr[i]) {
            return false;
        }
    }
    win = true;
    return true;
}

function loseRoutine() {
    resetButtonElement.style.animationPlayState = 'running';
    explosionSound.play()
    titleElement.textContent = "You Lose";
    titleElement.style.color = "red"; 
    headingElement.style.backgoundColor = headingLoseColor;
    bodyElement.style.backgroundImage = "none"
 
}

function winRoutine() {
    resetButtonElement.style.animationPlayState = 'running';
    titleElement.textContent = "You Win!";
    titleElement.style.color = winTextColor;
    winSound.play();
    for (let i = 0; i < 64; i++) {
        cells[i].isHidden = false; 
    }
    bodyElement.style.backgroundColor = winScreenColor;
    bodyElement.style.backgroundImage = "none"
    render() 
}

function startUp() {
    for (let i = 0; i < 64; i++) {
        cells.push({
            isMine: false,
            isHidden: true,
            value: 0,
            isFlagged: false,
        });
    }

    bombArr = generateBombs();
    generateBoard(bombArr);
    render();
}



startUp()
reset()