(function() {
    // Global variables initialisation.
    // Number of needed lines for finishing the party.
    var NB_LINES_TO_WIN;
    // Number of lines in the play grid.
    var TETRIS_GRID_NB_LINES;
    // Number of columns in the play grid.
    var TETRIS_GRID_NB_COLUMNS;
    // Number of lines in the preview grid.
    var PREVIEW_GRID_NB_LINES;
    // Number of columns in the preview grid.
    var PREVIEW_GRID_NB_COLUMNS;
    // Postion of the curent tetromino when appears (line).
    var C_TETROMINO_LINE_RESPAWN;
    // Postion of the curent tetromino when appears (columns).
    var C_TETROMINO_COL_RESPAWN;
    // Postion of the next tetromino when appears (line).
    var N_TETROMINO_LINE_RESPAWN;
    // Postion of the next tetromino when appears (column).
    var N_TETROMINO_COL_RESPAWN;
    // Curent tetromino.
    var C_TETROMINO;
    // Next tetromino.
    var N_TETROMINO;
    // Curent sequence of completed lines.
    var NB_LINES_SEQUENCE;
    // Game timer.
    var GAME_TIMER;
    // True if the game is paused, false otherwise.
    var GAME_IS_PAUSED;
    // True if the game is over (win or not), false otherwise.
    var GAME_IS_OVER;
    $(document).ready(function() {
        // global variables initialisation.
        NB_LINES_TO_WIN = 25, TETRIS_GRID_NB_LINES = 22, TETRIS_GRID_NB_COLUMNS = 10, PREVIEW_GRID_NB_LINES = 6, PREVIEW_GRID_NB_COLUMNS = 5;
        C_TETROMINO_LINE_RESPAWN = 1, C_TETROMINO_COL_RESPAWN = 5, N_TETROMINO_LINE_RESPAWN = 4, N_TETROMINO_COL_RESPAWN = 3;
        // Generate HTML grids.
        generateGrid("#tetrisGrid", TETRIS_GRID_NB_LINES, TETRIS_GRID_NB_COLUMNS);
        generateGrid("#previewGrid", PREVIEW_GRID_NB_LINES, PREVIEW_GRID_NB_COLUMNS);
        // Create runner (time of a party).
        $('#runner').runner();
        // Create and configure spinner for choosing the number of lines to win.
        $("#spinner").spinner();
        $('#spinner').spinner('option', 'min', 1);
        $('#spinner').spinner('option', 'max', 100);
        $("#spinner").spinner().spinner("value", NB_LINES_TO_WIN);
        // Create curent tetromino and nex tetromino.
        C_TETROMINO = new Tetromino(randomTetrominoType(), C_TETROMINO_LINE_RESPAWN, C_TETROMINO_COL_RESPAWN);
        N_TETROMINO = new Tetromino(randomTetrominoType(), N_TETROMINO_LINE_RESPAWN, N_TETROMINO_COL_RESPAWN);
        // Events
        $(document).keydown(keyPressed);
        $('#faderLevel').on("change mousemove", faderChange);
        $('#faderHeight').on("change mousemove", faderChange);
        $('#launchGame').on("click", function() {
            $('#modalNewGame').modal('toggle');
            newGameInitialisation();
        });
        // Initialise a new game.
        newGameInitialisation();
    });
    /*************************************************************************/
    /** Controls. */
    /*************************************************************************/
    // ----------------------------------------------------------------------------
    /** Change the gauge of height or level.*/
    const faderChange = function(event) {
        $(this).next().html($(this).val());
    }
    // ----------------------------------------------------------------------------
    /** Pause game.*/
    const pauseGame = function() {
        $('#runner').runner('toggle');
        $("#message").text("Pause");
        $("#message").show();
        GAME_IS_PAUSED = true;
    }
    // ----------------------------------------------------------------------------
    /** Resume game.*/
    const resumeGame = function() {
        $('#runner').runner('toggle');
        $("#message").hide();
        GAME_IS_PAUSED = false;
    }
    // ----------------------------------------------------------------------------
    /** Key pressed handler.*/
    const keyPressed = function(event) {
        switch (event.keyCode) {
            case $.ui.keyCode.LEFT:
                if (!GAME_IS_PAUSED && !GAME_IS_OVER) leftTetromino();
                break;
            case $.ui.keyCode.RIGHT:
                if (!GAME_IS_PAUSED && !GAME_IS_OVER) rightTetromino();
                break;
            case $.ui.keyCode.UP:
                if (!GAME_IS_PAUSED && !GAME_IS_OVER) spinTetromino();
                break;
            case $.ui.keyCode.DOWN:
                if (!GAME_IS_PAUSED && !GAME_IS_OVER) downTetromino();
                break;
            case $.ui.keyCode.SPACE:
                if (!GAME_IS_OVER) {
                    if (!GAME_IS_PAUSED) pauseGame();
                    else resumeGame();
                }
                break;
        }
    }
    // ----------------------------------------------------------------------------
    /** Automatic down of the curent tetromino. */
    const fallTetromino = function(event) {
        if (!GAME_IS_PAUSED && !GAME_IS_OVER) {
            removeTetromino("#tetrisGrid");
            downTetromino(C_TETROMINO);
            displayTetromino(C_TETROMINO, "#tetrisGrid");
        }
    }
    // ----------------------------------------------------------------------------
    /** Rotate a tetromino.*/
    const spinTetromino = function() {
        var oldRotation = C_TETROMINO.rotation;
        // Toggle.
        C_TETROMINO.toggle();
        // Check if new position is in collision or reach the bottom of the grid.
        if (tetrominoCollision(C_TETROMINO) || tetrominoOutOfGridBottom(C_TETROMINO)) {
            // Collision --> return to previous state.
            C_TETROMINO.rotation = oldRotation;
        } else {
            // Shift if outside the grid when rotate the block.
            var toRight = 0;
            var toLeft = 0;
            if (computeBlock(C_TETROMINO, "second").col < 1) toRight++;
            if (computeBlock(C_TETROMINO, "third").col < 1) toRight++;
            if (computeBlock(C_TETROMINO, "fourth").col < 1) toRight++;
            if (computeBlock(C_TETROMINO, "second").col > 10) toLeft++;
            if (computeBlock(C_TETROMINO, "third").col > 10) toLeft++;
            if (computeBlock(C_TETROMINO, "fourth").col > 10) toLeft++;
            if (toRight > 0 || toLeft > 0) C_TETROMINO.setFirstBlock(C_TETROMINO.first.line, eval(C_TETROMINO.first.col + toRight - toLeft));
            removeTetromino("#tetrisGrid");
            displayTetromino(C_TETROMINO, "#tetrisGrid");
        }
    }
    // ----------------------------------------------------------------------------
    /** Move tetromino to the right.*/
    const rightTetromino = function() {
        var oldLine = C_TETROMINO.first.line,
            oldCol = C_TETROMINO.first.col;
        var newLine = C_TETROMINO.first.line,
            newCol = C_TETROMINO.first.col + 1;
        C_TETROMINO.setFirstBlock(newLine, newCol);
        if (tetrominoOutOfGrid(C_TETROMINO) || tetrominoCollision(C_TETROMINO)) {
            C_TETROMINO.setFirstBlock(oldLine, oldCol);
        } else {
            removeTetromino("#tetrisGrid");
            displayTetromino(C_TETROMINO, "#tetrisGrid");
        }
    }
    // ----------------------------------------------------------------------------
    /** Move tetromino to the left.*/
    const leftTetromino = function() {
        var oldLine = C_TETROMINO.first.line,
            oldCol = C_TETROMINO.first.col;
        var newLine = C_TETROMINO.first.line,
            newCol = C_TETROMINO.first.col - 1;
        C_TETROMINO.setFirstBlock(newLine, newCol);
        if (tetrominoOutOfGrid(C_TETROMINO) || tetrominoCollision(C_TETROMINO)) {
            C_TETROMINO.setFirstBlock(oldLine, oldCol);
        } else {
            removeTetromino("#tetrisGrid");
            displayTetromino(C_TETROMINO, "#tetrisGrid");
        }
    }
    // ----------------------------------------------------------------------------
    /** Down tetromino.*/
    const downTetromino = function() {
        var oldLine = C_TETROMINO.first.line,
            oldCol = C_TETROMINO.first.col;
        var newLine = C_TETROMINO.first.line + 1,
            newCol = C_TETROMINO.first.col;
        C_TETROMINO.setFirstBlock(newLine, newCol);
        if (tetrominoOutOfGrid(C_TETROMINO) || tetrominoCollision(C_TETROMINO)) {
            if (newLine == 2) {
                gameOver();
            } else {
                C_TETROMINO.setFirstBlock(oldLine, oldCol);
                placeTetromino(C_TETROMINO);
                checkGrid();
                if (numberOfCompletedLines() >= NB_LINES_TO_WIN) win();
                nextTetromino();
                removeTetromino("#previewGrid");
                displayTetromino(N_TETROMINO, "#previewGrid");
            }
        } else {
            removeTetromino("#tetrisGrid");
            displayTetromino(C_TETROMINO, "#tetrisGrid");
        }
    }
    /*************************************************************************/
    /** Game engine. */
    /*************************************************************************/
    // ----------------------------------------------------------------------------
    /** Initialisation of a new game. */
    const newGameInitialisation = function() {
        // Blur the 'New Game' button when the new game starts.
        $('#new').focus(function() {
            this.blur();
        });
        clearInterval(GAME_TIMER);
        clearGrid("#tetrisGrid");
        clearGrid("#previewGrid");
        $('#runner').runner('reset');
        NB_LINES_SEQUENCE = 0;
        GAME_IS_PAUSED = false;
        GAME_IS_OVER = false;
        var level = $("#level").val();
        var height = $("#height").val();
        NB_LINES_TO_WIN = $("#spinner").spinner().spinner("value");
        $("#lineLeft").text(NB_LINES_TO_WIN);
        $("#curentLevel").text(level);
        $("#curentHeight").text(height);
        if (height > 0) generateHeight(height);
        C_TETROMINO.setFirstBlock(C_TETROMINO_LINE_RESPAWN, C_TETROMINO_COL_RESPAWN);
        N_TETROMINO.setFirstBlock(N_TETROMINO_LINE_RESPAWN, N_TETROMINO_COL_RESPAWN);
        C_TETROMINO.changeTetromino(randomTetrominoType());
        N_TETROMINO.changeTetromino(randomTetrominoType());
        displayTetromino(C_TETROMINO, "#tetrisGrid");
        displayTetromino(N_TETROMINO, "#previewGrid");
        $("#message").hide();
        // Create timer.
        GAME_TIMER = setInterval(fallTetromino, 1000 - (100 * level));
        $('#runner').runner('start');
    }
    // ----------------------------------------------------------------------------
    /** Generate random full cell on the grid until the given height. */
    const generateHeight = function(height) {
        var nbLines;
        switch (eval(height)) {
            case 1:
                nbLines = 1;
                break;
            case 2:
                nbLines = 3;
                break;
            case 3:
                nbLines = 5;
                break;
            case 4:
                nbLines = 7;
                break;
            case 5:
                nbLines = 8;
                break;
        }
        var nbBlockToSet;
        for (var i = TETRIS_GRID_NB_LINES; i >= TETRIS_GRID_NB_LINES - nbLines; i--) {
            nbBlockToSet = Math.floor(Math.random() * 3) + 5;
            for (var j = 0; j < nbBlockToSet; j++) {
                $("#tetrisGrid > div[data-line='" + i + "'][class*='cell']:not([class*='full-cell'])").random().addClass('full-cell');
            }
        }
    }
    // ----------------------------------------------------------------------------
    /**  Check completed lines and perform related actions if so.*/
    const checkGrid = function() {
        var completedLines = [];
        // First step: looking for completed lines.
        for (var i = 0; i <= TETRIS_GRID_NB_LINES; i++) {
            if ($("#tetrisGrid > div[data-line='" + i + "'][class*='cell'][class*='full-cell']").length == TETRIS_GRID_NB_COLUMNS) {
                completedLines.push(i);
                // Mark completed lines as 'to-delete'.
                $("#tetrisGrid > div[data-line='" + i + "'][class*='cell'][class*='full-cell']").addClass('cell-delete');
            }
        }
        // If at least one line is completed.
        var nbCompletedLines = completedLines.length;
        if (completedLines.length > 0) {
            for (var i = 0; i < nbCompletedLines; i++) {
                // Second step: mark above blocks that must be moved.
                $("#tetrisGrid > div[class*='cell'][class*='full-cell']").filter(function() {
                        return $(this).data('line') < completedLines[i];
                    })
                    // Mark movements for each concerned block.
                    .each(function() {
                        // Curent block will be free.
                        $(this).addClass('cell-delete');
                        // Block bellow will be full.
                        $("#tetrisGrid > div[data-line='" + eval($(this).data('line') + 1) + "'][data-col='" + $(this).data('col') + "'][class*='cell']").addClass('cell-add');
                    });
                // Third step: Make effective changes.
                // Free blocks.
                $("#tetrisGrid > div[class*='cell'][class*='cell-delete']").filter(function() {
                    return $(this).data('line') <= completedLines[i];
                }).removeClass("full-cell cell-delete");
                // Full blocks.
                $("#tetrisGrid > div[class*='cell'][class*='cell-add']").filter(function() {
                    return $(this).data('line') <= completedLines[i];
                }).addClass("full-cell").removeClass("cell-add");
            }
            // Last step: Update score and left.
            updateScore(nbCompletedLines);
            updateLeft();
        } else {
            // Reset sequence if no completed line.
            NB_LINES_SEQUENCE = 0;
        }
    }
    // ----------------------------------------------------------------------------
    /** get the actual number of completed lines.*/
    const numberOfCompletedLines = function() {
        return parseInt($("#simple").text()) + parseInt($("#double").text()) * 2 + parseInt($("#triple").text()) * 3 + parseInt($("#tetris").text() * 4);
    }
    // ----------------------------------------------------------------------------
    /** Update score according to the number of completed lines.*/
    const updateScore = function(nbCompletedLines) {
        var multiplier = 0;
        NB_LINES_SEQUENCE++;
        var height = $("#height").val();
        var level = $("#level").val();
        switch (nbCompletedLines) {
            case 1:
                $("#simple").text(parseInt($("#simple").text()) + 1);
                multiplier = 100;
                break;
            case 2:
                $("#double").text(parseInt($("#double").text()) + 1);
                multiplier = 300;
                break;
            case 3:
                $("#triple").text(parseInt($("#triple").text()) + 1);
                multiplier = 500;
                break;
            case 4:
                $("#tetris").text(parseInt($("#tetris").text()) + 1);
                multiplier = 800;
                break;
        }
        $("#score").text(parseInt($("#score").text()) + NB_LINES_SEQUENCE * (multiplier * (parseInt(height) + parseInt(level))));
    }
    // ----------------------------------------------------------------------------
    /** Update remaining lines.*/
    const updateLeft = function() {
        $("#lineLeft").text(NB_LINES_TO_WIN - numberOfCompletedLines());
    }
    // ----------------------------------------------------------------------------
    /** The player has completed the challenge.*/
    const win = function() {
        $('#runner').runner('stop');
        $("#tetrisGrid > div[class*='cell']").addClass("full-cell");
        $("#previewGrid > div[class*='cell']").addClass("full-cell");
        $("#message").text("You win!");
        $("#message").show();
        GAME_IS_OVER = true;
    }
    // ----------------------------------------------------------------------------
    /** Game is over: performs all needed actions.*/
    const gameOver = function() {
        $('#runner').runner('stop');
        $("#tetrisGrid > div[class*='cell']").addClass("full-cell");
        $("#previewGrid > div[class*='cell']").addClass("full-cell");
        $("#message").text("You lose!");
        $("#message").show();
        GAME_IS_OVER = true;
    }
    // ----------------------------------------------------------------------------
    /** Display next tetromino and generate a new one.*/
    const nextTetromino = function() {
        C_TETROMINO.first.line = C_TETROMINO_LINE_RESPAWN;
        C_TETROMINO.first.col = C_TETROMINO_COL_RESPAWN;
        C_TETROMINO.changeTetromino(N_TETROMINO.tetrominoName);
        N_TETROMINO.changeTetromino(randomTetrominoType());
    }
    // ----------------------------------------------------------------------------
    /** Turn tetromino's blocks into full cells. */
    const placeTetromino = function(tetromino) {
        var secondBlock = computeBlock(tetromino, 'second');
        var thirdBlock = computeBlock(tetromino, 'third');
        var fourthBlock = computeBlock(tetromino, 'fourth');
        $("#tetrisGrid > .cell[data-line='" + tetromino.first.line + "'][data-col='" + tetromino.first.col + "']").addClass("full-cell");
        $("#tetrisGrid > .cell[data-line='" + secondBlock.line + "'][data-col='" + secondBlock.col + "']").addClass("full-cell");
        $("#tetrisGrid > .cell[data-line='" + thirdBlock.line + "'][data-col='" + thirdBlock.col + "']").addClass("full-cell");
        $("#tetrisGrid > .cell[data-line='" + fourthBlock.line + "'][data-col='" + fourthBlock.col + "']").addClass("full-cell");
    }
    // ----------------------------------------------------------------------------
    /** Compute a given block of a given tetromino. */
    const computeBlock = function(tetromino, block) {
        return new Case(eval((tetromino.rules[tetromino.rotation][block]).line.replace("x", tetromino.first.line)), eval((tetromino.rules[tetromino.rotation][block]).col.replace("y", tetromino.first.col)));
    }
    // ----------------------------------------------------------------------------
    /** Pick up randomly an element in a list returned by a jQuery selector.*/
    $.fn.random = function() {
        // jQuery.fn = jQuery.prototype, extends JQuery functionalities.
        return this.eq(Math.floor(Math.random() * this.length));
    }
    //----------------------------------------------------------------------------
    /** Pick up randomly a tetromino type.*/
    const randomTetrominoType = function() {
        var tetrominoType = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        return tetrominoType[Math.floor(Math.random() * tetrominoType.length)];
    }
    /*************************************************************************/
    /** Rendering. */
    /*************************************************************************/
    // ----------------------------------------------------------------------------
    /** Generate HTML grid. */
    const generateGrid = function(grid, lines, columns) {
        for (var i = 1; i <= lines; i++) {
            for (var j = 1; j <= columns; j++) {
                $(grid).append('<div class="cell" data-line="' + i + '" data-col="' + j + '"></div>');
            }
        }
    }
    // ----------------------------------------------------------------------------
    /** Display tetromino on the grid.*/
    const displayTetromino = function(block, grid) {
        displayBlock(block.first, grid);
        displayBlock(computeBlock(block, "second"), grid);
        displayBlock(computeBlock(block, "third"), grid);
        displayBlock(computeBlock(block, "fourth"), grid);
    }
    // ----------------------------------------------------------------------------
    /** Display block on the grid.*/
    const displayBlock = function(c, grid) {
        $(grid).find(".cell[data-line='" + c.line + "'][data-col='" + c.col + "']").addClass("cell-block");
    }
    // ----------------------------------------------------------------------------
    /** Remove tetromino of the grid.*/
    const removeTetromino = function(grid) {
        $(grid).find(".cell").removeClass("cell-block");
    }
    // ----------------------------------------------------------------------------
    /** Clear the grid of full cell and tetromino.*/
    const clearGrid = function(grid) {
        $(grid).find(".cell").removeClass("full-cell cell-block");
    }
    /*************************************************************************/
    /** Collision/Out of grid detection. */
    /*************************************************************************/
    // ----------------------------------------------------------------------------
    /** Determine if a part of the tetromino is out of the grid .*/
    const tetrominoOutOfGrid = function(tetromino) {
        return blockOutOfGrid(tetromino.first) || blockOutOfGrid(computeBlock(tetromino, "second")) || blockOutOfGrid(computeBlock(tetromino, "third")) || blockOutOfGrid(computeBlock(tetromino, "fourth"));
    }
    // ----------------------------------------------------------------------------
    /** Determine if a part of the tetromino has collided a full cell. */
    const tetrominoCollision = function(tetromino) {
        return cellIsFull(tetromino.first) || cellIsFull(computeBlock(tetromino, "second")) || cellIsFull(computeBlock(tetromino, "third")) || cellIsFull(computeBlock(tetromino, "fourth"));
    }
    // ----------------------------------------------------------------------------
    /** Determine if tetromino has reached the bottom of the grid .*/
    const tetrominoOutOfGridBottom = function(tetromino) {
        return blockOutOfGridBottom(tetromino.first) || blockOutOfGridBottom(computeBlock(tetromino, "second")) || blockOutOfGridBottom(computeBlock(tetromino, "third")) || blockOutOfGridBottom(computeBlock(tetromino, "fourth"));
    }
    // ----------------------------------------------------------------------------
    /** Determine if block is outside the grid. */
    const blockOutOfGrid = function(block) {
        return blockOutOfGridLeft(block) || blockOutOfGridRight(block) || blockOutOfGridBottom(block);
    }
    // ----------------------------------------------------------------------------
    /** Determine if block is outside the grid (left). */
    const blockOutOfGridLeft = function(block) {
        return block.col < 1;
    }
    /** Determine if block is outside the grid (right). */
    const blockOutOfGridRight = function(block) {
        return block.col > TETRIS_GRID_NB_COLUMNS;
    }
    /** Determine if block is outside the grid (bottom). */
    const blockOutOfGridBottom = function(block) {
        return block.line > TETRIS_GRID_NB_LINES;
    }
    // ----------------------------------------------------------------------------
    /** Determine if a cell is full or not*/
    const cellIsFull = function(cell) {
        return $("#tetrisGrid > .cell[data-line='" + cell.line + "'][data-col='" + cell.col + "']").hasClass('full-cell');
    }
})();