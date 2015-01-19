/* ========================= QRDecomposition ==========================

Description: Javascript routines to decompose a matrix A into an
  orthogonal matrix Q and an upper triangular matrix R so that Q*R = A.
  Stored as methods of the global variable QRDecomposition.
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
var version = 'QRDecomposition 1.00';
/*

Uses Matrix.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

QR Decomposition (from the JAMA package)

For an m-by-n matrix A with m >= n, the QR decomposition is an m-by-n
orthogonal matrix Q and an n-by-n upper triangular matrix R so that
A = Q*R.

The QR decompostion always exists, even if the matrix does not have
full rank, so the constructor will never fail.  The primary use of the
QR decomposition is in the least squares solution of nonsquare systems
of simultaneous linear equations.  This will fail if isFullRank(qrd)
returns false for the QRDecomposition object qrd.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

***NOTE*** The functions in QRDecomposition.js should NOT normally be
  used directly.  Their main use to provide 'services' to the functions
  in Matrix.js.

QRDecomposition.create(mo): given a Matrix object mo, it returns an
  object from which Q and R can be accessed.

QRDecomposition.isFullRank(qrd): given an QRDecomposition object qrd, it
  determines whether the matrix from which it was derived is of full
  rank or not. The constant Matrix.EPS is used as the smallest non-zero
  number.

QRDecomposition.getH(qrd): given an QRDecomposition object qrd, it
  creates and returns the Householder vectors, H, as a Matrix object.
QRDecomposition.getR(qrd): given an QRDecomposition object qrd, it creates
  and returns the upper triangular factor, R, as a Matrix object.
QRDecomposition.getQ(qrd): given an QRDecomposition object qrd, it creates
  and returns the orthogonal factor, Q, as a Matrix object.

QRDecomposition.solve(qrd,B): if the QRDecomposition object qrd is
  derived from the matrix A, and the Matrix object B represents the matrix
  B, then this function returns the least squares solution to A*X = B,
  returning x as a Matrix object.
  B must have as many rows as A but may have any number of columns.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/

var QRDecomposition = new createQRDecompositionPackage();
function createQRDecompositionPackage()
{
this.version = version;

var abs = Math.abs;   // local synonym
var sqrt = Math.sqrt; // local synonym

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private function to check that an argument is a Matrix object
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _chkMatrix(fname,argno,arg)
{ if (!(arg instanceof Object && arg.isMatrix))
  { throw '***ERROR: in QRDecomposition.'+fname+': argument '+argno+
            ' is not a 2D matrix (Matrix).';
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private function to check that an argument is a QRDecomposition object
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _chkQRDecomposition(fname,argno,arg)
{ if (!(arg instanceof Object && arg.isQRDecomposition))
  { throw '***ERROR: in QRDecomposition.'+fname+': argument '+argno+
            ' is not an QRDecomposition.';
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private function to find sqrt(a^2 + b^2) reliably
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _hypot(a,b)
{ var r;
  if (abs(a) > abs(b))
  { r = b/a;
    r = abs(a)*sqrt(1+r*r);
  }
  else if (b != 0)
  { r = a/b;
    r = abs(b)*sqrt(1+r*r);
  }
  else
  { r = 0.0;
  }
  return r;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// QRDecomposition.create(mo): given a Matrix object mo, it returns an
//   object from which Q and R can be accessed.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.create = function (mo)
{ _chkMatrix('create',1,mo);
  var eps = Matrix.getEPS();
  if (mo.m < mo.n)
  { throw '***ERROR: in QRDecomposition.create: matrix has fewer rows than columns.';
  }
  // initialize
  var QR = (Matrix.create(mo.mat)).mat;
  var m = mo.m;
  var n = mo.n;
  var Rdiag = new Array(n);
  // main loop
  for (var k = 0; k < n; k++)
  { // compute 2-norm of k-th column without under/overflow.
    var nrm = 0;
    for (var i = k; i < m; i++)
    { nrm = _hypot(nrm,QR[i][k]);
    }
    if (abs(nrm) > eps)
    { // Form k-th Householder vector.
      if (QR[k][k] < 0)
      { nrm = -nrm;
      }
      for (var i = k; i < m; i++)
      { QR[i][k] /= nrm;
      }
      QR[k][k] += 1.0;
      // apply transformation to remaining columns
      for (var j = k+1; j < n; j++)
      { var s = 0.0;
        for (var i = k; i < m; i++)
        { s += QR[i][k]*QR[i][j];
        }
        s = -s/QR[k][k];
        for (var i = k; i < m; i++)
        { QR[i][j] += s*QR[i][k];
        }
      }
    }
    Rdiag[k] = -nrm;
  }
  var qrd = new Object();
  qrd.QR = QR;         // array for internal storage of decomposition.
  qrd.m = m;           // row dimension
  qrd.n = n;           // col dimension
  qrd.Rdiag = Rdiag;   // array for internal storage of diagonal of R
  qrd.isQRDecomposition = true;
  return qrd;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// QRDecomposition.isFullRank(qrd): given an QRDecomposition object qrd,
//   it determines whether the matrix from which it was derived is of full
//   rank or not. The constant eps is used as the smallest non-zero
//   number.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.isFullRank = function (qrd)
{ _chkQRDecomposition('isFullRank',1,qrd);
  var eps = Matrix.getEPS();
  with (qrd)
  { for (var j = 0; j < n; j++)
    { if (abs(Rdiag[j]) < eps) return false;
    }
  return true;
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// QRDecomposition.getH(qrd): given an QRDecomposition object qrd, it
//   creates and returns the Householder vectors, H, as a Matrix object.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.getH = function (qrd)
{ _chkQRDecomposition('getH',1,qrd);
  with (qrd)
  { var X = Matrix.create(m,n);
    var H = X.mat;
    for (var i = 0; i < m; i++)
    { for (var j = 0; j < n; j++)
      { if (i >= j)
        { H[i][j] = QR[i][j];
        }
        else
        { H[i][j] = 0.0;
        }
      }
    }
  }
  return X;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// QRDecomposition.getR(qrd): given an QRDecomposition object qrd, it
//   creates and returns the upper triangular factor, R, as a Matrix
//   object.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.getR = function (qrd)
{ _chkQRDecomposition('getR',1,qrd);
  with (qrd)
  { var X = Matrix.create(n,n);
    var R = X.mat;
    for (var i = 0; i < n; i++)
    { for (var j = 0; j < n; j++)
      { if (i < j) R[i][j] = QR[i][j];
        else if (i == j) R[i][j] = Rdiag[i];
        else R[i][j] = 0.0;
      }
    }
  }
  return X;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// QRDecomposition.getQ(qrd): given an QRDecomposition object qrd, it
//   creates and returns the orthogonal factor, Q, as a Matrix object.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.getQ = function (qrd)
{ _chkQRDecomposition('getQ',1,qrd);
  with (qrd)
  { var X = Matrix.create(m,n);
    var Q = X.mat;
    for (var k = n-1; k >= 0; k--)
    { for (var i = 0; i < m; i++) Q[i][k] = 0.0;
      Q[k][k] = 1.0;
      for (var j = k; j < n; j++)
      { if (QR[k][k] != 0)
        { var s = 0.0;
          for (var i = k; i < m; i++)
          { s += QR[i][k]*Q[i][j];
          }
          s = -s/QR[k][k];
          for (var i = k; i < m; i++)
          { Q[i][j] += s*QR[i][k];
          }
        }
      }
    }
  }
  return X;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// QRDecomposition.solve(qrd,B): if the QRDecomposition object qrd is
//   derived from the matrix A, and the Matrix object B represents the
//   matrix B, then this function returns the least squares solution to
//   A*X = B, returning x as a Matrix object.
//   B must have as many rows as A but may have any number of columns.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.solve = function (qrd,B)
{ _chkQRDecomposition('solve',1,qrd);
  _chkMatrix('solve',2,B);
  with (qrd)
  { if (B.m != m)
    { throw '***ERROR: in QRDecomposition.solve: matrix row dimensions don\'t agree.';
    }
    if (!QRDecomposition.isFullRank(qrd))
    { throw '***ERROR: in QRDecomposition.solve: matrix is rank deficient.';
    }
    // copy right hand side
    var nx = B.n;
    var Xm = Matrix.create(B.mat);
    var X = Xm.mat;
    // compute Y = transpose(Q)*B
    for (var k = 0; k < n; k++)
    { for (var j = 0; j < nx; j++)
      { var s = 0.0;
        for (var i = k; i < m; i++)
        { s += QR[i][k]*X[i][j];
        }
        s = -s/QR[k][k];
        for (var i = k; i < m; i++)
        { X[i][j] += s*QR[i][k];
        }
      }
    }
    // Solve R*X = Y;
    for (var k = n-1; k >= 0; k--)
    { for (var j = 0; j < nx; j++)
      { X[k][j] /= Rdiag[k];
      }
      for (var i = 0; i < k; i++)
      { for (var j = 0; j < nx; j++)
        { X[i][j] -= X[k][j]*QR[i][k];
        }
      }
    }
    // only need the first n rows
    var resmat = new Array(n);
    for (var i = 0; i < n; i++)
    { resmat[i] = X[i];
    }
  }
  return Matrix.create(resmat);
}

} // end of QRDecomposition