/* ========================= EVDecomposition ==========================

Description: Javascript routines to find the eigenvalues and
  eigenvectors of a matrix.
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
var version = 'EVDecomposition 1.00';
/*

Uses Matrix.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

EV Decomposition (from the JAMA package)

Eigenvalues and eigenvectors of a real matrix.

If A is symmetric, then A = V*L*V' where the eigenvalue matrix L is
diagonal and the eigenvector matrix V is orthogonal (i.e. V*V' = I).

If A is not symmetric, then the eigenvalue matrix L is block diagonal
with the real eigenvalues in 1-by-1 blocks and any complex eigenvalues,
lambda + i*mu, in 2-by-2 blocks, [lambda, mu; -mu, lambda].  The
columns of V represent the eigenvectors in the sense that A*V = V*L.
The matrix V may be badly conditioned, or even singular, so the validity
of the equation A = V*L*inverse(V) depends upon cond(V). **NB** this
test has not yet been implemented in these Javascript routines!

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

EVDecomposition.create(mo): given a Matrix object mo, it
  returns an EVDecomposition object which contains the eigenvectors
  and eigenvalues of the matrix. The fields of an EVDecomposition
  object are:
  V    the columnwise eigenvectors as a Matrix object
  lr   the real part of the eigenvalues as an array
  li   the imaginary part of the eigenvalues as an array
  L    the block diagonal eigenvalue matrix as a Matrix object
  isSymmetric   whether the matrix is symmetric or not (boolean)

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Example
-------

(Also uses IOUtils.js, Matrix.js and LUDecomposition.js.)

with (Matrix)
{ var A = create([[1,3,5],[2,8,1],[0,6,5]]);
  writeln('A');
  display(A,0);

  var evd = EVDecomposition.create(A);

  nl(); writeln('V (eigenvectors for A)');
  display(evd.V);

  nl(); writeln('L (block diagonal eigenvalue matrix for A)');
  display(evd.L);
  writeln('Note that the second two eigenvalues are complex: 1.632 + 1.816i and 1.632 - 1.816i.');

  nl(); writeln('A*V - V*L');
  display(sub(mult(A,evd.V),mult(evd.V,evd.L)));

  nl(); writeln('A - V*L*inverse(V)');
  display(sub(A,mult(evd.V,mult(evd.L,inverse(evd.V)))));
}

*/

var EVDecomposition = new createEVDecompositionPackage();
function createEVDecompositionPackage()
{
this.version = version;

var abs = Math.abs;    // local synonym
var sqrt = Math.sqrt;  // local synonym
var max = Math.max;    // local synonym
var min = Math.min;    // local synonym

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Utility function to find sqrt(a^2 + b^2) reliably
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _hypot(a,b)
{ var r;
  var aa = abs(a);
  var bb = abs(b);
  if (aa > bb)
  { r = b/a;
    r = aa*sqrt(1+r*r);
  }
  else if (b != 0)
  { r = a/b;
    r = bb*sqrt(1+r*r);
  }
  else r = 0.0;
  return r;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// 'Global' variables used to communicate between functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var n;           // row and column dimension (square matrix)
var isSymmetric; // whether matrix is symmetric
var d; var e;    // arrays for internal storage of eigenvalues
var V;           // array for internal storage of eigenvectors.
var H;           // array for internal storage of nonsymmetric Hessenberg form.
var ort;         // working storage for nonsymmetric algorithm.

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private function to perform the symmetric Householder reduction to
// tridiagonal form.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _tred2 ()
{ //  This is derived from the Algol procedures tred2 by
  //  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
  //  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
  //  Fortran subroutine in EISPACK.

  for (var j = 0; j < n; j++)
  { d[j] = V[n-1][j];
  }

  // Householder reduction to tridiagonal form.
  for (var i = n-1; i > 0; i--)
  { // Scale to avoid under/overflow.
    var scale = 0.0;
    var h = 0.0;
    for (var k = 0; k < i; k++)
    { scale = scale + abs(d[k]);
    }
    if (scale == 0.0)
    { e[i] = d[i-1];
      for (var j = 0; j < i; j++)
      { d[j] = V[i-1][j];
        V[i][j] = 0.0;
        V[j][i] = 0.0;
      }
    }
    else
    { // Generate Householder vector.
      for (var k = 0; k < i; k++)
      { d[k] /= scale;
        h += d[k] * d[k];
      }
      var f = d[i-1];
      var g = sqrt(h);
      if (f > 0)
      { g = -g;
      }
      e[i] = scale * g;
      h = h - f * g;
      d[i-1] = f - g;
      for (var j = 0; j < i; j++)
      { e[j] = 0.0;
      }
      // Apply similarity transformation to remaining columns.
      for (var j = 0; j < i; j++)
      { f = d[j];
        V[j][i] = f;
        g = e[j] + V[j][j] * f;
        for (var k = j+1; k <= i-1; k++)
        { g += V[k][j] * d[k];
          e[k] += V[k][j] * f;
        }
        e[j] = g;
      }
      f = 0.0;
      for (var j = 0; j < i; j++)
      { e[j] /= h;
        f += e[j] * d[j];
      }
      var hh = f / (h + h);
      for (var j = 0; j < i; j++)
      { e[j] -= hh * d[j];
      }
      for (var j = 0; j < i; j++)
      { f = d[j];
        g = e[j];
        for (var k = j; k <= i-1; k++)
        { V[k][j] -= (f * e[k] + g * d[k]);
        }
        d[j] = V[i-1][j];
        V[i][j] = 0.0;
      }
    }
    d[i] = h;
  }
  // Accumulate transformations.
  for (var i = 0; i < n-1; i++)
  { V[n-1][i] = V[i][i];
    V[i][i] = 1.0;
    var h = d[i+1];
    if (h != 0.0)
    { for (var k = 0; k <= i; k++)
      { d[k] = V[k][i+1] / h;
      }
      for (var j = 0; j <= i; j++)
      { var g = 0.0;
         for (var k = 0; k <= i; k++)
         { g += V[k][i+1] * V[k][j];
         }
         for (var k = 0; k <= i; k++)
         { V[k][j] -= g * d[k];
         }
      }
    }
    for (var k = 0; k <= i; k++)
    { V[k][i+1] = 0.0;
    }
  }
  for (var j = 0; j < n; j++)
  { d[j] = V[n-1][j];
    V[n-1][j] = 0.0;
  }
  V[n-1][n-1] = 1.0;
  e[0] = 0.0;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private function to perform the symmetric tridiagonal QL algorithm.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _tql2 ()
{ //  This is derived from the Algol procedures tql2, by
  //  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
  //  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
  //  Fortran subroutine in EISPACK.
  var eps = 0.5*Matrix.getEPS();
  
  for (var i = 1; i < n; i++)
  { e[i-1] = e[i];
  }
  e[n-1] = 0.0;

  var f = 0.0;
  var tst1 = 0.0;
  for (var l = 0; l < n; l++)
  { // Find small subdiagonal element
    tst1 = max(tst1,abs(d[l]) + abs(e[l]));
    var m = l;
    while (m < n)
    { if (abs(e[m]) <= eps*tst1)
      { break;
      }
      m++;
    }

    // If m == l, d[l] is an eigenvalue,
    // otherwise, iterate.
    if (m > l)
    { var iter = 0;
      do
      { iter = iter + 1;  // (Could check iteration count here.)
        // Compute implicit shift
        var g = d[l];
        var p = (d[l+1] - g) / (2.0 * e[l]);
        var r = _hypot(p,1.0);
        if (p < 0)
        { r = -r;
        }
        d[l] = e[l] / (p + r);
        d[l+1] = e[l] * (p + r);
        var dl1 = d[l+1];
        var h = g - d[l];
        for (var i = l+2; i < n; i++)
        { d[i] -= h;
        }
        f = f + h;

        // Implicit QL transformation.
        p = d[m];
        var c = 1.0;
        var c2 = c;
        var c3 = c;
        var el1 = e[l+1];
        var s = 0.0;
        var s2 = 0.0;
        for (var i = m-1; i >= l; i--)
        { c3 = c2;
          c2 = c;
          s2 = s;
          g = c * e[i];
          h = c * p;
          r = _hypot(p,e[i]);
          e[i+1] = s * r;
          s = e[i] / r;
          c = p / r;
          p = c * d[i] - s * g;
          d[i+1] = h + s * (c * g + s * d[i]);

          // Accumulate transformation.
          for (var k = 0; k < n; k++)
          { h = V[k][i+1];
            V[k][i+1] = s * V[k][i] + c * h;
            V[k][i] = c * V[k][i] - s * h;
          }
        }
        p = -s * s2 * c3 * el1 * e[l] / dl1;
        e[l] = s * p;
        d[l] = c * p;


      }
      while (abs(e[l]) > eps*tst1); // Check for convergence
    }
    d[l] = d[l] + f;
    e[l] = 0.0;
  }

  // Sort eigenvalues and corresponding vectors.
  for (var i = 0; i < n-1; i++)
  { var k = i;
    var p = d[i];
    for (var j = i+1; j < n; j++)
    { if (d[j] < p)
      { k = j;
        p = d[j];
      }
    }
    if (k != i)
    { d[k] = d[i];
      d[i] = p;
      for (var j = 0; j < n; j++)
      { p = V[j][i];
        V[j][i] = V[j][k];
        V[j][k] = p;
      }
    }
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private function to perform the nonsymmetric reduction to Hessenberg
// form.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _orthes ()
{ //  This is derived from the Algol procedures orthes and ortran,
  //  by Martin and Wilkinson, Handbook for Auto. Comp.,
  //  Vol.ii-Linear Algebra, and the corresponding
  //  Fortran subroutines in EISPACK.

  var low = 0;
  var high = n-1;

  for (var m = low+1; m <= high-1; m++)
  {  // Scale column.
    var scale = 0.0;
    for (var i = m; i <= high; i++)
    { scale = scale + abs(H[i][m-1]);
    }
    if (scale != 0.0)
    { // Compute Householder transformation.
      var h = 0.0;
      for (var i = high; i >= m; i--)
      { ort[i] = H[i][m-1]/scale;
         h += ort[i] * ort[i];
      }
      var g = sqrt(h);
      if (ort[m] > 0)
      { g = -g;
      }
      h = h - ort[m] * g;
      ort[m] = ort[m] - g;

      // Apply Householder similarity transformation
      // H = (I-u*u'/h)*H*(I-u*u')/h)
      for (var j = m; j < n; j++)
      { var f = 0.0;
        for (var i = high; i >= m; i--)
        { f += ort[i]*H[i][j];
        }
        f = f/h;
        for (var i = m; i <= high; i++)
        { H[i][j] -= f*ort[i];
        }
      }
      for (var i = 0; i <= high; i++)
      { var f = 0.0;
        for (var j = high; j >= m; j--)
        { f += ort[j]*H[i][j];
        }
        f = f/h;
        for (var j = m; j <= high; j++)
        { H[i][j] -= f*ort[j];
        }
      }
      ort[m] = scale*ort[m];
      H[m][m-1] = scale*g;
    }
  }

  // Accumulate transformations (Algol's ortran).
  for (var i = 0; i < n; i++)
  { for (var j = 0; j < n; j++)
    { V[i][j] = (i == j ? 1.0 : 0.0);
    }
  }
  for (var m = high-1; m >= low+1; m--)
  { if (H[m][m-1] != 0.0)
    { for (var i = m+1; i <= high; i++)
      { ort[i] = H[i][m-1];
      }
      for (var j = m; j <= high; j++)
      { var g = 0.0;
        for (var i = m; i <= high; i++)
        { g += ort[i] * V[i][j];
        }
        // Double division avoids possible underflow
        g = (g / ort[m]) / H[m][m-1];
        for (var i = m; i <= high; i++)
        { V[i][j] += g * ort[i];
        }
      }
    }
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private function to perform complex scalar division.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _cdiv(xr,xi,yr,yi)
{ var cdivr,cdivi;
  var r,d;
  if (abs(yr) > abs(yi))
  { r = yi/yr;
    d = yr + r*yi;
    cdivr = (xr + r*xi)/d;
    cdivi = (xi - r*xr)/d;
  }
  else
  { r = yr/yi;
    d = yi + r*yr;
    cdivr = (r*xr + xi)/d;
    cdivi = (r*xi - xr)/d;
  }
  return {r:cdivr, i:cdivi};
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private function to perform nonsymmetric reduction from Hessenberg to
// real Schur form.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _hqr2 ()
{ //  This is derived from the Algol procedure hqr2,
  //  by Martin and Wilkinson, Handbook for Auto. Comp.,
  //  Vol.ii-Linear Algebra, and the corresponding
  //  Fortran subroutine in EISPACK.
  var eps = 0.5*Matrix.getEPS();
  
  // Initialize
  var nn = n;
  var n1 = nn-1;
  var low = 0;
  var high = nn-1;
  var exshift = 0.0;
  var p=0,q=0,r=0,s=0,z=0,t,w,x,y;

  // Store roots isolated by balanc and compute matrix norm

  var norm = 0.0;
  for (var i = 0; i < nn; i++)
  {
    if (i < low || i > high)
    {
      d[i] = H[i][i];
      e[i] = 0.0;
    }
    for (var j = max(i-1,0); j < nn; j++)
    {
      norm = norm + abs(H[i][j]);
    }
  }

  // Outer loop over eigenvalue index

  var iter = 0;
  while (n1 >= low)
  { // Look for single small sub-diagonal element
    var l = n1;
    while (l > low)
    {
      s = abs(H[l-1][l-1]) + abs(H[l][l]);
      if (s == 0.0)
      {
        s = norm;
      }
      if (abs(H[l][l-1]) < eps * s)
      {
        break;
      }
      l--;
    }

    // Check for convergence
    // One root found
    if (l == n1)
    {
      H[n1][n1] = H[n1][n1] + exshift;
      d[n1] = H[n1][n1];
      e[n1] = 0.0;
      n1--;
      iter = 0;
    }
    // Two roots found
    else if (l == n1-1)
    {
      w = H[n1][n1-1] * H[n1-1][n1];
      p = (H[n1-1][n1-1] - H[n1][n1]) / 2.0;
      q = p * p + w;
      z = sqrt(abs(q));
      H[n1][n1] = H[n1][n1] + exshift;
      H[n1-1][n1-1] = H[n1-1][n1-1] + exshift;
      x = H[n1][n1];

      // Real pair
      if (q >= 0)
      {
        if (p >= 0)
        {
          z = p + z;
        }
        else
        {
          z = p - z;
        }
        d[n1-1] = x + z;
        d[n1] = d[n1-1];
        if (z != 0.0)
        {
          d[n1] = x - w / z;
        }
        e[n1-1] = 0.0;
        e[n1] = 0.0;
        x = H[n1][n1-1];
        s = abs(x) + abs(z);
        p = x / s;
        q = z / s;
        r = sqrt(p * p+q * q);
        p = p / r;
        q = q / r;

        // Row modification
        for (var j = n1-1; j < nn; j++)
        {
          z = H[n1-1][j];
          H[n1-1][j] = q * z + p * H[n1][j];
          H[n1][j] = q * H[n1][j] - p * z;
        }

        // Column modification
        for (var i = 0; i <= n1; i++)
        {
          z = H[i][n1-1];
          H[i][n1-1] = q * z + p * H[i][n1];
          H[i][n1] = q * H[i][n1] - p * z;
        }

        // Accumulate transformations
        for (var i = low; i <= high; i++)
        {
          z = V[i][n1-1];
          V[i][n1-1] = q * z + p * V[i][n1];
          V[i][n1] = q * V[i][n1] - p * z;
        }
      }
      // Complex pair
      else
      {
        d[n1-1] = x + p;
        d[n1] = x + p;
        e[n1-1] = z;
        e[n1] = -z;
      }
      n1 = n1 - 2;
      iter = 0;
    }
    // No convergence yet
    else
    {
      // Form shift
      x = H[n1][n1];
      y = 0.0;
      w = 0.0;
      if (l < n1)
      {
        y = H[n1-1][n1-1];
        w = H[n1][n1-1] * H[n1-1][n1];
      }

      // Wilkinson's original ad hoc shift
      if (iter == 10)
      {
        exshift += x;
        for (var i = low; i <= n1; i++)
        {
          H[i][i] -= x;
        }
        s = abs(H[n1][n1-1]) + abs(H[n1-1][n1-2]);
        x = y = 0.75 * s;
        w = -0.4375 * s * s;
      }

      // MATLAB's new ad hoc shift
      if (iter == 30)
      {
        s = (y - x) / 2.0;
        s = s * s + w;
        if (s > 0)
        {
          s = sqrt(s);
          if (y < x)
          {
            s = -s;
          }
          s = x - w / ((y - x) / 2.0 + s);
          for (var i = low; i <= n1; i++)
          {
            H[i][i] -= s;
          }
          exshift += s;
          x = y = w = 0.964;
        }
      }

      iter = iter + 1;   // (Could check iteration count here.)

      // Look for two consecutive small sub-diagonal elements
      var m = n1-2;
      while (m >= l)
      {
        z = H[m][m];
        r = x - z;
        s = y - z;
        p = (r * s - w) / H[m+1][m] + H[m][m+1];
        q = H[m+1][m+1] - z - r - s;
        r = H[m+2][m+1];
        s = abs(p) + abs(q) + abs(r);
        p = p / s;
        q = q / s;
        r = r / s;
        if (m == l)
        {
          break;
        }
        if (abs(H[m][m-1]) * (abs(q) + abs(r)) <
          eps * (abs(p) * (abs(H[m-1][m-1]) + abs(z) +
          abs(H[m+1][m+1]))))
          {
             break;
          }
          m--;
        }

        for (var i = m+2; i <= n1; i++)
        {
          H[i][i-2] = 0.0;
          if (i > m+2)
          {
            H[i][i-3] = 0.0;
          }
        }

        // Double QR step involving rows l:n1 and columns m:n1
        for (var k = m; k <= n1-1; k++)
        {
          var notlast = (k != n1-1);
          if (k != m)
          {
            p = H[k][k-1];
            q = H[k+1][k-1];
            r = (notlast ? H[k+2][k-1] : 0.0);
            x = abs(p) + abs(q) + abs(r);
            if (x != 0.0)
            {
              p = p / x;
              q = q / x;
              r = r / x;
            }
          }
          if (x == 0.0)
          {
            break;
          }
          s = sqrt(p * p + q * q + r * r);
          if (p < 0)
          {
            s = -s;
          }
          if (s != 0)
          {
            if (k != m)
            {
              H[k][k-1] = -s * x;
            }
            else if (l != m)
            {
              H[k][k-1] = -H[k][k-1];
            }
            p = p + s;
            x = p / s;
            y = q / s;
            z = r / s;
            q = q / p;
            r = r / p;

            // Row modification
            for (var j = k; j < nn; j++)
            {
              p = H[k][j] + q * H[k+1][j];
              if (notlast)
              {
                p = p + r * H[k+2][j];
                H[k+2][j] = H[k+2][j] - p * z;
              }
              H[k][j] = H[k][j] - p * x;
              H[k+1][j] = H[k+1][j] - p * y;
            }

            // Column modification
            for (var i = 0; i <= min(n1,k+3); i++)
            {
              p = x * H[i][k] + y * H[i][k+1];
              if (notlast)
              {
                p = p + z * H[i][k+2];
                H[i][k+2] = H[i][k+2] - p * r;
              }
              H[i][k] = H[i][k] - p;
              H[i][k+1] = H[i][k+1] - p * q;
            }

            // Accumulate transformations
            for (var i = low; i <= high; i++)
            {
               p = x * V[i][k] + y * V[i][k+1];
               if (notlast)
               {
                 p = p + z * V[i][k+2];
                 V[i][k+2] = V[i][k+2] - p * r;
               }
               V[i][k] = V[i][k] - p;
               V[i][k+1] = V[i][k+1] - p * q;
            }
          }  // (s != 0)
        }  // k loop
      }  // check convergence
    }  // while (n >= low)

    // Backsubstitute to find vectors of upper triangular form
    if (norm == 0.0)
    {
      return;
    }

    for (n1 = nn-1; n1 >= 0; n1--)
    {
      p = d[n1];
      q = e[n1];

      // Real vector
      if (q == 0)
      {
        var l = n1;
        H[n1][n1] = 1.0;
        for (var i = n1-1; i >= 0; i--)
        {
          w = H[i][i] - p;
          r = 0.0;
          for (var j = l; j <= n1; j++)
          {
            r = r + H[i][j] * H[j][n1];
          }
          if (e[i] < 0.0)
          {
            z = w;
            s = r;
          }
          else
          {
            l = i;
            if (e[i] == 0.0)
            {
              if (w != 0.0)
              {
                H[i][n1] = -r / w;
              }
              else
              {
                H[i][n1] = -r / (eps * norm);
              }

            }
            // Solve real equations
            else
            {
              x = H[i][i+1];
              y = H[i+1][i];
              q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
              t = (x * s - z * r) / q;
              H[i][n1] = t;
              if (abs(x) > abs(z))
              {
                H[i+1][n1] = (-r - w * t) / x;
              }
              else
              {
                H[i+1][n1] = (-s - y * t) / z;
              }
            }

            // Overflow control
            t = abs(H[i][n1]);
            if ((eps * t) * t > 1)
            {
              for (var j = i; j <= n1; j++)
              {
                H[j][n1] = H[j][n1] / t;
              }
            }
          }
        }

      }
      // Complex vector
      else if (q < 0)
      {
      var l = n1-1;

      // Last vector component imaginary so matrix is triangular
      if (abs(H[n1][n1-1]) > abs(H[n1-1][n1]))
      {
        H[n1-1][n1-1] = q / H[n1][n1-1];
        H[n1-1][n1] = -(H[n1][n1] - p) / H[n1][n1-1];
      }
      else
      {
        var cd = _cdiv(0.0,-H[n1-1][n1],H[n1-1][n1-1]-p,q);
        H[n1-1][n1-1] = cd.r;
        H[n1-1][n1] = cd.i;
      }
      H[n1][n1-1] = 0.0;
      H[n1][n1] = 1.0;
      for (var i = n1-2; i >= 0; i--)
      {
        var ra,sa,vr,vi;
        ra = 0.0;
        sa = 0.0;
        for (var j = l; j <= n1; j++)
        {
          ra = ra + H[i][j] * H[j][n1-1];
          sa = sa + H[i][j] * H[j][n1];
        }
        w = H[i][i] - p;

        if (e[i] < 0.0)
        {
          z = w;
          r = ra;
          s = sa;
        }
        else
        {
          l = i;
          if (e[i] == 0)
          {
            var cd = _cdiv(-ra,-sa,w,q);
            H[i][n1-1] = cd.r;
            H[i][n1] = cd.i;
          }
          else
          {
            // Solve complex equations
            x = H[i][i+1];
            y = H[i+1][i];
            vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
            vi = (d[i] - p) * 2.0 * q;
            if (vr == 0.0 && vi == 0.0)
            {
              vr = eps * norm * (abs(w) + abs(q) +
              abs(x) + abs(y) + abs(z));
            }
            var cd = _cdiv(x*r-z*ra+q*sa,x*s-z*sa-q*ra,vr,vi);
            H[i][n1-1] = cd.r;
            H[i][n1] = cd.i;
            if (abs(x) > (abs(z) + abs(q)))
            {
              H[i+1][n1-1] = (-ra - w * H[i][n1-1] + q * H[i][n1]) / x;
              H[i+1][n1] = (-sa - w * H[i][n1] - q * H[i][n1-1]) / x;
            }
            else
            {
              var cd = _cdiv(-r-y*H[i][n1-1],-s-y*H[i][n1],z,q);
              H[i+1][n1-1] = cd.r;
              H[i+1][n1] = cd.i;
            }
          }

          // Overflow control
          t = max(abs(H[i][n1-1]),abs(H[i][n1]));
          if ((eps * t) * t > 1)
          {
            for (var j = i; j <= n1; j++)
            {
              H[j][n1-1] = H[j][n1-1] / t;
              H[j][n1] = H[j][n1] / t;
            }
          }
        }
      }
    }
  }

  // Vectors of isolated roots
  for (var i = 0; i < nn; i++)
  {
    if (i < low || i > high)
    {
      for (var j = i; j < nn; j++)
      {
        V[i][j] = H[i][j];
      }
    }
  }

  // Back transformation to get eigenvectors of original matrix
  for (var j = nn-1; j >= low; j--)
  {
    for (var i = low; i <= high; i++)
    {
      z = 0.0;
      for (var k = low; k <= min(j,high); k++)
      {
         z = z + V[i][k] * H[k][j];
      }
      V[i][j] = z;
    }
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private function to create the block diagonal eigenvalue matrix.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function _getL()
{ var X = Matrix.create(n,n);
  var L = X.mat;
  for (var i = 0; i < n; i++)
  { for (var j = 0; j < n; j++) L[i][j] = 0.0;
    L[i][i] = d[i];
    if (e[i] > 0) L[i][i+1] = e[i];
    else if (e[i] < 0) L[i][i-1] = e[i];
  }
  return X;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// EVDecomposition.create(mo): given a matrix as a Matrix object mo, it
//   returns an EVDecomposition object which contains the eigenvectors
//   and eigenvalues of the matrix. The fields of an EVDecomposition
//   object are:
//   V   the columnwise eigenvectors as a Matrix object
//   lr  the real part of the eigenvalues as an array
//   li  the imaginary part of the eigenvalues as an array
//   L   the block diagonal eigenvalue matrix as a Matrix object
//   isSymmetric  whether the matrix is symmetric or not (boolean)
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.create = function (mo)
{ var A = mo.mat;
  n = mo.n;
  V = new Array(n);
  for (var i = 0; i < n; i++) V[i] = new Array(n);
  d = new Array(n);
  e = new Array(n);

  // is the matrix symmetric?
  isSymmetric = true;
  for (var j = 0; (j < n) && isSymmetric; j++)
  { for (var i = 0; (i < n) && isSymmetric; i++)
    { isSymmetric = (A[i][j] == A[j][i]);
    }
  }

  // process the matrix
  if (isSymmetric)
  { // process a symmetric matrix
    for (var i = 0; i < n; i++)
    { for (var j = 0; j < n; j++) V[i][j] = A[i][j];
    }
    // Tridiagonalize.
    _tred2();
    // Diagonalize.
    _tql2();
  }
  else
  { // process an unsymmetic matrix
    H = new Array(n);
    for (var i = 0; i < n; i++) H[i] = new Array(n);
    ort = new Array(n);
    for (var j = 0; j < n; j++)
    { for (var i = 0; i < n; i++) H[i][j] = A[i][j];
    }
    // Reduce to Hessenberg form.
    _orthes();
    // Reduce Hessenberg to real Schur form.
    _hqr2();
  }

  // reduce small values in d & e to 0 (added by PC)
  var eps = Matrix.getEPS();
  for (var i = 0; i < n; i++)
  { if (abs(d[i]) < eps) d[i] = 0;
    if (abs(e[i]) < eps) e[i] = 0;
  }

  // Sort d, e and L by the size of real part of eigenvalue
  // with 0's at the end.  Care is needed not to re-order pairs of complex
  // eigenvalues.                      (added by PC)
  var last = 0;
  for (var i = 0; i < n-1; i++)
  { var dMax = d[i];
    var iMax = i;
    for (var j = i+1; j < n; j++)
    { var swapNeeded = false;
      if (d[j] != 0)
      { if (dMax == 0) swapNeeded = true;
        else
        { var diff = d[j] - dMax;
          if (diff > eps) swapNeeded = true;
          else if (abs(diff) < eps) swapNeeded = e[j] > e[iMax];
        }
      }
      if (swapNeeded)
      { dMax = d[j];
        iMax = j;
      }
    }
    if (i != iMax)
    { var temp = d[i];
      d[i] = d[iMax];
      d[iMax] = temp;
      temp = e[i];
      e[i] = e[iMax];
      e[iMax] = temp;
      for (var j = 0; j < n; j++)
       { temp = V[j][i];
         V[j][i] = V[j][iMax];
         V[j][iMax] = temp;
       }
    }
    if (d[i] != 0 || e[i] != 0) last = i;
  }
  if (d[n-1] != 0 || e[n-1] != 0) last = n-1;

  // create an object to return the results
  var evd = new Object();
  evd.V = Matrix.create(V);
  evd.lr = d;
  evd.li = e;
  evd.L = _getL(); // create the block diagonal eigenvalue matrix
  evd.isSymmetric = isSymmetric;
  evd.isEVDecomposition = true;
  return evd;
}


}
