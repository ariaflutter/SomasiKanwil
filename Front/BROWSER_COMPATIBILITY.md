# Browser Compatibility Guide

This document provides information about browser compatibility issues and solutions for the SomasiKanwil application.

## Supported Browsers

### Recommended Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Partially Supported Browsers
- Internet Explorer 11 (limited functionality)
- Opera 75+
- Other modern browsers with ES6 support

## Known Issues and Solutions

### 1. Service Worker Caching Issues
**Problem**: The application may not update properly in some browsers due to service worker caching.

**Solution**: 
- We've disabled the service worker registration in `main.js` to prevent caching issues
- Clear browser cache if you experience stale data
- Use hard refresh (Ctrl+F5 or Cmd+Shift+R) to force reload

### 2. Cross-Origin Requests (CORS)
**Problem**: Some browsers block cross-origin requests to external BAPAS servers.

**Solution**:
- Added explicit CORS headers to all fetch requests
- Implemented fallback error handling
- Added `mode: 'cors'` and `credentials: 'omit'` to fetch options

### 3. WebSocket Connections
**Problem**: WebSocket connections may fail in some browsers or network environments.

**Solution**:
- Added fallback to polling transport for Socket.IO
- Increased timeout values
- Added proper error handling and reconnection logic

### 4. Map Initialization and Pin Display
**Problem**: Leaflet map may not initialize properly or pins may not display in some browsers due to race conditions.

**Solution**:
- Increased initialization timeout to 1000ms for better cross-browser compatibility
- Added proper DOM element checks before map initialization
- Implemented sequential marker processing to avoid race conditions
- Added tile layer load event to ensure map is ready before adding markers
- Added fallback mechanism if tile load event doesn't fire
- Implemented proper error handling for marker creation and addition
- Added map bounds fitting to ensure all markers are visible
- Improved clearMapMarkers function with proper layer checks

## Testing Your Browser

### Using the Browser Test Page
1. Open `browser-test.html` in your browser
2. Click "Run Compatibility Tests" to check basic browser features
3. Click "Test API Connections" to verify connectivity to backend services
4. Click "Test WebSocket Connection" to verify WebSocket support

### Manual Testing Checklist
1. **Basic Navigation**: All pages should load without errors
2. **Map Functionality**: The map should load and display markers
3. **Real-time Updates**: New reports should appear automatically
4. **Responsive Design**: Layout should adapt to different screen sizes
5. **Data Loading**: All charts and statistics should load correctly

## Troubleshooting Steps

### If the Application Doesn't Load:
1. Check browser console for errors (F12 → Console)
2. Verify you're using a supported browser version
3. Clear browser cache and cookies
4. Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)
5. Disable browser extensions temporarily
6. Check network connection and firewall settings

### If Map Doesn't Load or Pins Don't Show:
1. Check if JavaScript is enabled
2. Verify network connectivity to OpenStreetMap tiles
3. Check browser console for map-related errors (look for "[PETA]" prefixed messages)
4. Try zooming in/out to trigger tile loading
5. Wait a few seconds after page load for markers to appear (there's a 2-second fallback)
6. Check if there are any network errors in the console related to BAPAS servers
7. Try changing the month/year filter to trigger a refresh of the markers
8. Clear browser cache and reload the page

### If Charts Don't Display Data:
1. Check browser console for "[CHART]" prefixed messages
2. Verify the canvas elements are present in the DOM
3. Check if data is being fetched from the API endpoints (look for "[DASHBOARD]" messages)
4. Try refreshing the page to reload data
5. Check if there are any JavaScript errors in the console
6. Verify the data processing functions are working correctly
7. Check if reactive statements are triggering when data changes
8. Ensure Socket.IO connections are established for real-time updates

### If Real-time Updates Don't Work:
1. Check WebSocket connection status in browser console (look for "[SOCKET]" messages)
2. Verify network allows WebSocket connections
3. Check if browser is in private/incognito mode (some restrict WebSockets)
4. Try refreshing the page

### If External BAPAS Data Doesn't Load:
1. Check CORS settings in browser
2. Verify network connectivity to external domains
3. Check if any browser extensions are blocking cross-origin requests
4. Try disabling ad blockers or privacy extensions

## Development Notes

### CORS Configuration
The Vite development server is configured with:
- `host: '0.0.0.0'` to allow access from any device on the network
- CORS enabled for all routes
- Custom headers to prevent caching issues

### Build Configuration
The production build is optimized for:
- ES2015 compatibility (supports older browsers)
- Proper chunking of vendor libraries
- Optimized asset loading

### Error Handling
The application includes:
- Browser compatibility checks on startup
- Fallback error messages for network failures
- Graceful degradation when features aren't available
- Detailed console logging for debugging

## Running the Development Server

To run the development server with cross-browser compatibility:

```bash
# Standard development mode
npm run dev

# Browser testing mode (same as dev but explicitly named)
npm run test:browser

# Production build
npm run build:prod
```

The server will be available at `http://localhost:8080` and accessible from other devices on your network.

## Reporting Issues

If you encounter browser compatibility issues:
1. Note the browser name and version
2. Check the browser console for errors
3. Test with the `browser-test.html` page
4. Document the specific steps to reproduce the issue
5. Include screenshots if possible