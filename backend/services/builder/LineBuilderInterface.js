/**
 * @interface LineBuilderInterface
 */
class LineBuilderInterface {
  reset() {
    throw new Error("Method 'reset()' must be implemented.");
  }

  /**
   * @param {string} name
   */
  setName(name) {
    throw new Error("Method 'setName(name)' must be implemented.");
  }

  /**
   * @param {Object} point
   */
  setStartPlace(point) {
    throw new Error("Method 'setStartPlace(point)' must be implemented.");
  }

  /**
   * @param {Object} point
   */
  setEndPlace(point) {
    throw new Error("Method 'setEndPlace(point)' must be implemented.");
  }

  /**
   * @param {Object[]} stops
   */
  setArrStop(stops) {
    throw new Error("Method 'setArrStop(stops)' must be implemented.");
  }

  /**
   * @param {number} time
   */
  setTime(time) {
    throw new Error("Method 'setTime(time)' must be implemented.");
  }

  /**
   * @param {string} status
   */
  setStatus(status) {
    throw new Error("Method 'setStatus(status)' must be implemented.");
  }
  /**
   * @returns {Object} LineRequest
   */
  getResult() {
    throw new Error("Method 'getResult()' must be implemented.");
  }
}

module.exports = LineBuilderInterface;
