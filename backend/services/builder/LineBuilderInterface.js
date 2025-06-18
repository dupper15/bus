/**
 * Interface for Line Builder
 * @interface LineBuilderInterface
 */
class LineBuilderInterface {
  /**
   * Resets the builder to initial state.
   */
  reset() {
    throw new Error("Method 'reset()' must be implemented.");
  }

  /**
   * Sets the name of the line.
   * @param {string} name - The name of the line.
   */
  setName(name) {
    throw new Error("Method 'setName(name)' must be implemented.");
  }

  /**
   * Sets the start point.
   * @param {Object} point - The starting point (e.g., { x: number, y: number }).
   */
  setStartPlace(point) {
    throw new Error("Method 'setStartPlace(point)' must be implemented.");
  }

  /**
   * Sets the end point.
   * @param {Object} point - The ending point (e.g., { x: number, y: number }).
   */
  setEndPlace(point) {
    throw new Error("Method 'setEndPlace(point)' must be implemented.");
  }

  /**
   * Sets the array of stop points.
   * @param {Object[]} stops - Array of stop points.
   */
  setArrStop(stops) {
    throw new Error("Method 'setArrStop(stops)' must be implemented.");
  }

  /**
   * Sets the estimated time.
   * @param {number} time - Duration in minutes or seconds.
   */
  setTime(time) {
    throw new Error("Method 'setTime(time)' must be implemented.");
  }

  /**
   * Returns the final line request object.
   * @returns {Object} LineRequest
   */
  getResult() {
    throw new Error("Method 'getResult()' must be implemented.");
  }
}

module.exports = LineBuilderInterface;
