/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\.(t|j)sx?$': ['ts-jest', { tsconfig: './tsconfig.vitest.json' }],
    },
    moduleNameMapper: {
        '^@testing-library/react$': '<rootDir>/node_modules/@testing-library/react',
        '\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
}