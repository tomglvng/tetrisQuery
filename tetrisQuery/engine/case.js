/** Represent a block in a tetromino or a cell in a grid by its position (line, column).*/
function Case(line, col) {
    this.line = line;
    this.col = col;
};
/** Return a string that represents a case.*/
Case.prototype.toString = function() {
    return 'line[' + this.line + ']col[' + this.col + ']';
};