// Import the functions to test
const { distSq, pointSegmentDistance } = require('../js/script');

// Test suite for distSq function
describe('distSq', () => {
    test('should return 0 for the same point', () => {
        expect(distSq(10, 10, 10, 10)).toBe(0);
    });

    test('should return correct squared distance for horizontal line', () => {
        expect(distSq(2, 5, 6, 5)).toBe(16);
    });

    test('should return correct squared distance for vertical line', () => {
        expect(distSq(3, 1, 3, 5)).toBe(16);
    });

    test('should return correct squared distance for diagonal line', () => {
        expect(distSq(1, 2, 4, 6)).toBe(25); // 3^2 + 4^2 = 9 + 16 = 25
    });
});

// Mock p5.js dist function for pointSegmentDistance tests
// We need this because pointSegmentDistance uses p5.js's global dist()
const mockDist = jest.fn((x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
});
global.dist = mockDist;

// Mock Math.max and Math.min as they might be used indirectly or directly
// although in the current pointSegmentDistance they are used correctly
global.Math.max = jest.fn(Math.max);
global.Math.min = jest.fn(Math.min);


// Test suite for pointSegmentDistance function
describe('pointSegmentDistance', () => {
    beforeEach(() => {
        // Reset mocks before each test
        mockDist.mockClear();
        global.Math.max.mockClear();
        global.Math.min.mockClear();
    });

    test('should return 0 if point is on the segment', () => {
        expect(pointSegmentDistance(5, 0, 0, 0, 10, 0)).toBe(0);
        expect(mockDist).toHaveBeenCalledWith(5, 0, 5, 0);
    });

    test('should return distance to the closest endpoint if projection is outside segment (start)', () => {
        expect(pointSegmentDistance(-2, 0, 0, 0, 10, 0)).toBe(2);
        // Checks if it correctly calculated the distance to the start point (0, 0)
        expect(mockDist).toHaveBeenCalledWith(-2, 0, 0, 0);
    });

    test('should return distance to the closest endpoint if projection is outside segment (end)', () => {
        expect(pointSegmentDistance(12, 0, 0, 0, 10, 0)).toBe(2);
        // Checks if it correctly calculated the distance to the end point (10, 0)
        expect(mockDist).toHaveBeenCalledWith(12, 0, 10, 0);
    });

    test('should return perpendicular distance if projection is inside segment', () => {
        expect(pointSegmentDistance(5, 3, 0, 0, 10, 0)).toBe(3);
        // Checks if it correctly calculated the distance to the projected point (5, 0)
        expect(mockDist).toHaveBeenCalledWith(5, 3, 5, 0);
    });

    test('should handle vertical lines correctly', () => {
        expect(pointSegmentDistance(2, 5, 0, 0, 0, 10)).toBe(2);
        // Checks if it correctly calculated the distance to the projected point (0, 5)
        expect(mockDist).toHaveBeenCalledWith(2, 5, 0, 5);
    });

    test('should handle segment being a single point', () => {
        expect(pointSegmentDistance(3, 4, 0, 0, 0, 0)).toBe(5); 
        expect(mockDist).toHaveBeenCalledWith(3, 4, 0, 0); // Should just calculate dist to the point
    });
}); 