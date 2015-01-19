/* ========================= IO Utilities ==========================

Description: Javascript routines to 'write' to web pages.
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: Peter Coxhead, 2008; released under GPLv3
  (http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 15 Dec 2008
*/
var version = 'IOUtils 1.01';
/*

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

The first call must be to startOutput(obj,msg). Subsequent calls
to 'output' functions add to the output buffer. The last call must
be to endOutput(). This displays the buffer in the innerHTML field
of obj. The string msg is shown until endOutput() is executed.

startOutput(obj,msg): initializes the output buffer and sets up
  obj.innerHTML as the ultimate destination of the output. The
  string msg will be shown until endOutput is called.
endOutput(): puts the output buffer in the HTML object set
  up by startOutput.

write(msg): adds the string msg to the output buffer.
writeln(msg): adds the string msg to the output buffer, followed
  by a line break.
print is a synonym of write.
println is a synonym of writeln.
nl(): adds a line break to the output buffer.

startTable(): starts a new table in the output buffer.
endTable(): ends a new table in the output buffer.
newRow(): starts a new row in a table.
writeCell(msg): puts the string msg into a single table cell.

displayMat(m,colLab,rowLab,dp): adds the 2D array m as a table to
  the output buffer. The arguments colLab and rowLab, if not null,
  must be arrays of strings to serveas the column and row labels.
  If dp is not null, it defines the number of decimal places
  shown; the default is 3.

displayAT(t): adds the tree t, which must be in array
 representation, to the output buffer.
 An example of a tree in array representation is [1,[2,3]].
 
IOUtils.js also adds an additional method to the Number object.
fixed(w,d): returns a number in fixed point notation as a 
  string of at least w characters 'wide' with d decimal places.

*/

var IOUtils = {version: version};

// Globals for the output.
var _outputObj;
var _outputBuffer;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Variables which determine how text is output.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var LFT = '<span style="white-space: pre; font-family: monospace">';
var RGT = '</span>';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// startOutput(obj,msg): initializes the output buffer and sets up
//   obj.innerHTML as the ultimate destination of the output. The
//   string msg will be shown until endOutput is called.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function startOutput(obj,msg)
{ _outputObj = obj;
  _outputBuffer = '';
  _outputObj.innerHTML = msg;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// endOutput(): puts the output buffer in the HTML object set
//  up by startOutput.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function endOutput()
{ _outputObj.innerHTML = _outputBuffer;
  _outputBuffer = '';
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// write(msg): adds the string msg to the output buffer.
// print is a synonym of write.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function write(msg)
{ _outputBuffer += (LFT+msg+RGT);
}
var print = write;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// writeln(msg): adds the string msg to the output buffer, followed
//   by a line break.
// println is a synonym of writeln.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function writeln(msg)
{ _outputBuffer += (LFT+msg+RGT+'<br />');
}
var println = writeln;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// nl(): adds a line break to the output buffer.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function nl()
{ _outputBuffer += ('<br />');
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// startTable(): starts a new table in the output buffer.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var _rowStarted = false;
function startTable()
{ _outputBuffer += '<table border="1"><tr>';
  _rowStarted = true;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// endTable(): ends a new table in the output buffer.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function endTable()
{ if(_rowStarted)
  { _outputBuffer += '</tr>';
    _rowStarted = false;
  }
  _outputBuffer += '</table>';
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// newRow(): starts a new row in a table.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function newRow()
{ _outputBuffer += '</tr>';
  _rowStarted = false;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// writeCell(msg): puts the string msg into a single table cell.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function writeCell(msg)
{ if(!_rowStarted)
  { _outputBuffer += '<tr>';
    _rowStarted = true;
  }
  _outputBuffer += ('<td style="text-align: right;">'+LFT+msg+RGT+'</td>');
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// displayMat(m,colLab,rowLab,dp): adds the 2D array m as a table to
//   the output buffer. The arguments colLab and rowLab, if not null,
//   must be arrays of strings to serveas the column and row labels.
//   If dp is not null, it defines the number of decimal places
//   shown; the default is 3.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function displayMat(m,colLab,rowLab,dp)
{ startTable();
  if (colLab != null)
  { writeCell('');
    for(var j=0; j<colLab.length; j++) writeCell(colLab[j]);
    newRow();
  }
  if (dp == null) dp = 3;
  for(var i=0; i<m.length; i++)
  { if(rowLab != null) writeCell(rowLab[i]);
    for(var j=0; j<m[i].length; j++)
    { writeCell(m[i][j].toFixed(dp));
    }
    newRow();
  }
  endTable();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Trees can be represented in Javacript by arrays, e.g. [1,[2,3]].
// displayAT(t): adds the tree t, which must be in array
//  representation, to the output buffer.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function displayAT(t)
{ if(!(t instanceof Array))
  { write(t);
  }
  else if(t.length == 2)
  { write('(');displayAT(t[0]);write(', ');displayAT(t[1]);write(')');
  }
  else alert('***ERROR: displayAT given an array of length '+t.length);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Additional method for the Number object.
// fixed(w,d): returns a number in fixed point notation as a string
//   of at least w in width with d decimal places.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Number.prototype.fixed = function (w,d)
{ var s = this.toFixed(d);
  var t ='';
  for (var i = 0; i < w - s.length; i++) t += ' ';
  return t+s;
}


