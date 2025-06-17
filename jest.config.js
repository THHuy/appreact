// jest.config.js
module.exports = {
  coveragePathIgnorePatterns: ["/node_modules/", "reportWebVitals.js"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "\\.(svg|jpg|jpeg|png|gif|webp|css|scss)$":
      "<rootDir>/__mocks__/fileMock.js",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
};
