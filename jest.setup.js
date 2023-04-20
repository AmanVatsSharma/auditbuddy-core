import { server } from './__tests__/test-setup/server'

// Mock browser globals
global.Buffer = require('buffer').Buffer

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close()) 