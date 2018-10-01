/* ========================= LUDecomposition ==========================

Description: Javascript routines to decompose a matrix A into a lower
  and an upper triangular matrix, L and U, so that L*U = A (possibly
  with its rows re-ordered).  Stored as methods of the global variable
  LUDecomposition.
Acknowledgement: This Javascript code is based on the source code of
  JAMA, A Java Matrix package (http://math.nist.gov/javanumerics/jama/),
  which states "Copyright Notice This software is a cooperative product
  of The MathWorks and the National Institute of Standards and
  Technology (NIST) which has been released to the public domain.
  Neither The MathWorks nor NIST assumes any responsibility whatsoever
  for its use by other parties, and makes no guarantees, expressed
  or implied, about its quality, reliability, or any other
  characteristic."
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: The conversion of the JAMA source to Javascript is
  copyright Peter Coxhead, 2008, and is released under GPLv3
  (http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 9 Dec 2008
*/
var version = 'LUDecomposition 1.00';
/*

Uses Matrix.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

LU Decomposition (from the JAMA package)

For an m-by-n matrix A with m >= n, the LU decomposition is an m-by-n
unit lower triangular matrix L, an n-by-n upper triangular matrix U,
and a permutation vector piv of length m so that A(piv,:) = L*U.
If m < n, then L is m-by-m and U is m-by-n.

The LU decomposition with pivoting always exists, even if the matrix is
singular, so the constructor will never fail.  The primary use of the
LU decomposition is in the solution of square systems of simultaneous
linear equations.  This will fail if isNonsingular() returns false.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

***NOTE*** The functions in LUDecomposition.js should NOT normally be
  used directly.  Their main use to provide 'services' to the functions
  in Matrix.js.

LUDecomposition.create(mo): given a Matrix object mo, it returns an
  object from which L, U and piv can be accessed.

LUDecomposition.restore(mo,lud): returns a new Matrix object comprised
  of the rows of the Matrix object mo restored to the order given in
  the pivot of the LUDecomposition object lud.

LUDecomposition.isNonsingular(lud): given an LUDecomposition object lud, it
  determines whether the matrix from which it was derived is singular or
  not. The value of Matrix.getEPS() is used as the smallest non-zero
  number.

LUDecomposition.getL(lud): given an LUDecomposition object lud, it creates
  and returns the lower triangular factor, L, as a Matrix object.
LUDecomposition.getU(lud): given an LUDecomposition object lud, it creates
  and returns the upper triangular factor, U, as a Matrix object.

LUDecomposition.det(lud): given an LUDecomposition object lud, it returns
  the determinant of the matrix from which it was derived. The value of
  Matrix.getEPS() is used as the smallest non-zero number.

LUDecomposition.solve(lud,bmat): if the LUDecomposition object lud is derived
  from the matrix A, and the Matrix object bmat represents the matrix b, then
  this function solves the matrix equation A*x = b, returning x as a Matrix
  object.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/

var LUDecomposition = new createLUDecompositionPackage();
function createLUDecompositionPackage()
{
this.version = version;

var abs = Math.abs;   // local synonym
var min = Math.min;   // local synonym

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private function to check that an argument is a Matrix object.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _chkMatrix(fname,argno,arg)
{ if (!arg.isMatrix)
  { writeln('***ERROR: in LUDecomposition.'+fname+': argument '+argno+
            ' is not a Matrix.');
    throw null;
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private function to check that an argument is an LUDecomposition object
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _chkLUDecomposition(fname,argno,arg)
{ if (!arg.isLUDecomposition)
  { writeln('***ERROR: in LUDecomposition.'+fname+': argument '+argno+
            ' is not an LUDecomposition.');
    throw null;
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// LUDecomposition.create(mo): given a Matrix object mo, it returns an
//   object from which L, U and piv can be accessed.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.create = function (mo)
{ _chkMatrix('create',1,mo);
  var m;        // row dimension
  var n;        // col dimension
  // Use a "left-looking", dot-product, Crout/Doolittle algorithm.
  var matLU = Matrix.create(mo.mat);
  var LU = matLU.mat;
  m = mo.m;
  n = mo.n;
  var piv = new Array();
  for (var i = 0; i < m; i++) piv[i] = i;
  var pivsign = 1;
  var LUrowi;
  var LUcolj = new Array(m);
  // outer loop
  for (var j = 0; j < n; j++)
  { // make a copy of the j-th column to localize references
    for (var i = 0; i < m; i++) LUcolj[i] = LU[i][j];
    // apply previous transformations
    for (var i = 0; i < m; i++)
    { LUrowi = LU[i];
      // most of the time is spent in the following dot product
      var kmax = min(i,j);
      var s = 0.0;
      for (var k = 0; k < kmax; k++) s += LUrowi[k]*LUcolj[k];
      LUrowi[j] = LUcolj[i] -= s;
    }
    // find pivot and exchange if necessary.
    var p = j;
    for (var i = j+1; i < m; i++)
    { if (abs(LUcolj[i]) > abs(LUcolj[p])) p = i;
    }
    if (p != j)
    { for (var k = 0; k < n; k++)
      { var t = LU[p][k];
        LU[p][k] = LU[j][k];
        LU[j][k] = t;
      }
      var k = piv[p];
      piv[p] = piv[j];
      piv[j] = k;
      pivsign = -pivsign;
    }
    // compute multipliers
    if (j < m && LU[j][j] != 0.0)
    { for (var i = j+1; i < m; i++) LU[i][j] /= LU[j][j];
    }
  }
  // now create and return the object with the results
  var lud = new Object();
  lud.LU = LU;
  lud.m = m;
  lud.n = n;
  lud.pivsign = pivsign;
  lud.piv = piv;
  lud.isLUDecomposition = true;
  return lud;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// LUDecomposition.restore(mo,lud): returns a new Matrix object comprised
//   of the rows of the Matrix object mo restored to the order given in the
//   pivot of the LUDecomposition object lud.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.restore = function (mo,lud)
{ _chkMatrix('restore',1,mo);
  _chkLUDecomposition('restore',2,lud);
  var res = Matrix.create(mo.m,mo.n);
  var r = lud.piv;
  for (var i = 0; i < mo.m; i++)
    for (var j = 0; j < mo.n; j++)
      res.mat[r[i]][j] = mo.mat[i][j];
  return res;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//LUDecomposition.isNonsingular(lud): given an LUDecomposition object lud, it
//  determines whether the matrix from which it was derived is singular or
//  not. The value of Matrix.getEPS() is used as the smallest non-zero
//  number.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.isNonsingular = function (lud)
{ _chkLUDecomposition('isNonsingular',1,lud);
  var eps = Matrix.getEPS();
  with (lud)
  { for (var j = 0; j < n; j++)
    { if (abs(LU[j][j]) < eps) return false;
    }
  }
  return true;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// LUDecomposition.getL(lud): given an LUDecomposition object lud, it creates
//   and returns the lower triangular factor, L, as a Matrix object.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.getL = function (lud)
{ _chkLUDecomposition('getL',1,lud);
  var xm = lud.m;
  var xn = (lud.m >= lud.n)? lud.n : lud.m;
  var X = Matrix.create(xm,xn);
  var L = X.mat;
  with (lud)
  { for (var i = 0; i < xm; i++)
    { for (var j = 0; j < xn; j++)
      { if (i > j) L[i][j] = LU[i][j];
        else if (i == j)  L[i][j] = 1.0;
        else L[i][j] = 0.0;
      }
    }
  }
  return X;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// LUDecomposition.getU(lud): given an LUDecomposition object lud, it creates
//   and returns the upper triangular factor, U, as a Matrix object.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.getU = function (lud)
{ _chkLUDecomposition('getU',1,lud);
  var xm = (lud.m >= lud.n)? lud.n : lud.m;
  var xn = lud.n;
  var X = Matrix.create(xm,xn);
  var U = X.mat;
  with (lud)
  { for (var i = 0; i < xm; i++)
    { for (var j = 0; j < xn; j++)
      { if (i <= j) U[i][j] = LU[i][j];
        else U[i][j] = 0.0;
      }
    }
  }
  return X;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// LUDecomposition.det(lud): given an LUDecomposition object lud, it
//   returns the determinant of the matrix from which it was derived. The
//   value of Matrix.getEPS() is used as the smallest non-zero number.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.det = function (lud)
{ _chkLUDecomposition('det',1,lud);
  var eps = Matrix.getEPS();
  if (lud.m != lud.n)
  { writeln('***ERROR: in LUDecomposition.det: argument 1 is not square.');
     throw null;
  }
  var d = lud.pivsign;
  with (lud)
  { for (var j = 0; j < n; j++)
    { var val = LU[j][j];
      d *= LU[j][j];
      if (abs(d) < eps) return 0;
    }
  }
  return d;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// _arrange(mo,r): a private function which returns a new Matrix object
//  comprisedof the rows of the Matrix object mo arranged according to
//  the values in the array r.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _arrange(mo,r)
{ with (mo)
  { var res = Matrix.create(m,n);
    for (var i = 0; i < m; i++)
      for (var j = 0; j < n; j++)
        res.mat[i][j] = mat[r[i]][j];
  }
  return res;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// LUDecomposition.solve(lud,bmat): if the LUDecomposition object lud is
//   derived from the matrix A, and the Matrix object bmat represents the
//   matrix b, then this function solves the matrix equation A*x = b,
//   returning x as a Matrix object.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.solve = function (lud,bmat)
{ _chkMatrix('solve',2,bmat);
  _chkLUDecomposition('solve',1,lud);
  if (bmat.m != lud.m)
  { writeln('***ERROR: in LUDecomposition.solve: matrix row dimensions do not agree.');
    throw null;
  }
  if (!this.isNonsingular(lud))
  { writeln('***ERROR: in LUDecomposition.solve: matrix is singular.');
    throw null;
  }
  // copy right hand side with pivoting
  var nx = bmat.n;
  var Xmat = _arrange(bmat,lud.piv);
  var X = Xmat.mat;
  // solve L*Y = B(piv,:)
  with (lud)
  { for (var k = 0; k < n; k++)
    { for (var i = k+1; i < n; i++)
      { for (var j = 0; j < nx; j++)
        { X[i][j] -= X[k][j]*LU[i][k];
        }
      }
    }
    // solve U*X = Y
    for (var k = n-1; k >= 0; k--)
    { for (var j = 0; j < nx; j++)
      { X[k][j] /= LU[k][k];
      }
      for (var i = 0; i < k; i++)
      { for (var j = 0; j < nx; j++)
        { X[i][j] -= X[k][j]*LU[i][k];
        }
      }
    }
  }
  return Xmat;
}

}
