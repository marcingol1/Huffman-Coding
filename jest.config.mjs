import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts', '**/*.test.tsx'],
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }
});
