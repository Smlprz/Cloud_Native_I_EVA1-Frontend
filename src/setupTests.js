import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// react-router necesita estas APIs, que jsdom no trae.
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;
