import MatrixCalculator from "./components/MatrixCalculator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Matrix Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Add, subtract, multiply, transpose matrices and compute determinants
            and inverses. Grid input up to 5×5 with step-by-step for 2×2 and 3×3.
          </p>
        </div>

        {/* Tool */}
        <MatrixCalculator />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Matrix Operations Explained
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A matrix is a rectangular array of numbers arranged in rows and
            columns. Matrix operations are fundamental to linear algebra and
            appear throughout engineering, computer graphics, machine learning,
            and physics simulations.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Addition and Subtraction
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Two matrices can be added or subtracted only when they have the same
            number of rows and the same number of columns. The operation is
            performed element-by-element: each entry in the result equals the
            sum (or difference) of the corresponding entries in the two input
            matrices.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Matrix Multiplication
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            To multiply matrix A (m × n) by matrix B (p × q), the number of
            columns in A must equal the number of rows in B (n = p). The result
            is an m × q matrix. Each entry (i, j) of the result is the dot
            product of row i of A and column j of B. Unlike scalar
            multiplication, matrix multiplication is generally not commutative:
            A × B ≠ B × A.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Transpose
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The transpose of a matrix is formed by swapping its rows and
            columns. The entry at row i, column j of the original becomes the
            entry at row j, column i of the transpose. An m × n matrix becomes
            an n × m matrix. Symmetric matrices are equal to their own
            transpose.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Determinant
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The determinant is a single scalar value computed from a square
            matrix. For a 2×2 matrix with entries a, b, c, d, the determinant
            is ad − bc. For a 3×3 matrix the cofactor expansion along the first
            row gives det(A) = a(ei − fh) − b(di − fg) + c(dh − eg). The
            determinant is zero for singular matrices (those with no inverse),
            non-zero for invertible ones.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Inverse
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The inverse A⁻¹ of a square matrix A is defined by A × A⁻¹ = I,
            where I is the identity matrix. An inverse exists only when the
            determinant is non-zero. This calculator uses Gauss–Jordan
            elimination on the augmented matrix [A | I] to compute A⁻¹
            directly, which is numerically stable for matrices up to 5×5.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Applications
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Computer graphics</strong> — rotation, scaling, and
              projection transformations are expressed as matrix multiplications
              applied to vertex coordinates.
            </li>
            <li>
              <strong>Machine learning</strong> — neural network layers compute
              a matrix multiplication between the weight matrix and the input
              vector, followed by a non-linearity.
            </li>
            <li>
              <strong>Systems of equations</strong> — a linear system Ax = b
              can be solved as x = A⁻¹b when A is invertible, or via
              elimination otherwise.
            </li>
            <li>
              <strong>Statistics</strong> — covariance matrices, principal
              component analysis, and regression all rely on matrix operations.
            </li>
            <li>
              <strong>Physics simulations</strong> — rigid-body dynamics,
              finite-element methods, and quantum mechanics all use matrix
              algebra extensively.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Matrix Calculator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://bitwise-calculator-nu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Bitwise Calculator</a>
              <a href="https://unit-converter-mu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Unit Converter</a>
              <a href="/base64-tools" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
