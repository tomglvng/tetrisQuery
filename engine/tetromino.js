/** Represent a four-block figure.*/
class Tetromino {
    /** Constructor.*/
    constructor(tetrominoName, firstLine, firstCol) {
        // Name determines the tetromino type.
        this.tetrominoName = tetrominoName;
        // First block of the tetromino, the 3 others are determined according to this one.
        this.first = new Case(firstLine, firstCol);
        // Curent rotation of the tetromino (up to 4).
        this.rotation = 0;
        // Rules are used to determine position of other blocks according to the first one and the curent rotation.
        this.setRules();
    }
    /** List of rules to determine blocks position.*/
    setRules() {
        // Position are determinated with eval() when needed.
        // E.g: rules[0]['second'] -> How to determinate position of the second block for the first rotation?
        // E.g: rules[2]['fourth'] -> How to determinate position of the fourth block for the third rotation?
        switch (this.tetrominoName) {
            case "I":
                this.rules = {
                    0: {
                        "second": new Case("x+1", "y"),
                        "third": new Case("x-1", "y"),
                        "fourth": new Case("x-2", "y")
                    },
                    1: {
                        "second": new Case("x", "y+1"),
                        "third": new Case("x", "y+2"),
                        "fourth": new Case("x", "y-1")
                    },
                }
                break;
            case "O":
                this.rules = {
                    0: {
                        "second": new Case("x", "y-1"),
                        "third": new Case("x+1", "y"),
                        "fourth": new Case("x+1", "y-1")
                    },
                    1: {
                        "second": new Case("x", "y-1"),
                        "third": new Case("x+1", "y"),
                        "fourth": new Case("x+1", "y-1")
                    },
                }
                break;
            case "T":
                this.rules = {
                    0: {
                        "second": new Case("x-1", "y"),
                        "third": new Case("x", "y-1"),
                        "fourth": new Case("x+1", "y")
                    },
                    1: {
                        "second": new Case("x-1", "y"),
                        "third": new Case("x", "y-1"),
                        "fourth": new Case("x", "y+1")
                    },
                    2: {
                        "second": new Case("x-1", "y"),
                        "third": new Case("x", "y+1"),
                        "fourth": new Case("x+1", "y")
                    },
                    3: {
                        "second": new Case("x", "y-1"),
                        "third": new Case("x", "y+1"),
                        "fourth": new Case("x+1", "y")
                    },
                }
                break;
            case "S":
                this.rules = {
                    0: {
                        "second": new Case("x+1", "y"),
                        "third": new Case("x", "y+1"),
                        "fourth": new Case("x-1", "y+1")
                    },
                    1: {
                        "second": new Case("x", "y-1"),
                        "third": new Case("x+1", "y"),
                        "fourth": new Case("x+1", "y+1")
                    },
                }
                break;
            case "Z":
                this.rules = {
                    0: {
                        "second": new Case("x-1", "y"),
                        "third": new Case("x", "y+1"),
                        "fourth": new Case("x+1", "y+1")
                    },
                    1: {
                        "second": new Case("x", "y+1"),
                        "third": new Case("x+1", "y"),
                        "fourth": new Case("x+1", "y-1")
                    },
                }
                break;
            case "J":
                this.rules = {
                    0: {
                        "second": new Case("x", "y+1"),
                        "third": new Case("x", "y-1"),
                        "fourth": new Case("x+1", "y-1")
                    },
                    1: {
                        "second": new Case("x-1", "y"),
                        "third": new Case("x+1", "y"),
                        "fourth": new Case("x+1", "y+1")
                    },
                    2: {
                        "second": new Case("x", "y-1"),
                        "third": new Case("x", "y+1"),
                        "fourth": new Case("x-1", "y+1")
                    },
                    3: {
                        "second": new Case("x+1", "y"),
                        "third": new Case("x-1", "y"),
                        "fourth": new Case("x-1", "y-1")
                    },
                }
                break;
            case "L":
                this.rules = {
                    0: {
                        "second": new Case("x+1", "y"),
                        "third": new Case("x", "y-1"),
                        "fourth": new Case("x", "y-2")
                    },
                    1: {
                        "second": new Case("x+1", "y"),
                        "third": new Case("x-1", "y"),
                        "fourth": new Case("x-1", "y+1")
                    },
                    2: {
                        "second": new Case("x", "y+1"),
                        "third": new Case("x", "y-1"),
                        "fourth": new Case("x-1", "y-1")
                    },
                    3: {
                        "second": new Case("x-1", "y"),
                        "third": new Case("x+1", "y"),
                        "fourth": new Case("x+1", "y-1")
                    },
                }
                break;
        }
    }
    /** Change rotation of the tetromino.*/
    toggle() {
        var next = (this.rotation + 1) % (Object.keys(this.rules).length);
        this.rotation = next;
    }
    /** Define the first block of the tetromino.*/
    setFirstBlock(line, col) {
        this.first.line = line;
        this.first.col = col;
    }
    /** Change the type of tetromino. */
    changeTetromino(tetrominoName) {
        this.tetrominoName = tetrominoName;
        this.rotation = 0;
        this.setRules();
    }
}