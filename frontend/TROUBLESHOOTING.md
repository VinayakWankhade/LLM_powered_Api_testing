# Frontend Troubleshooting Guide

## Issues Resolved

### 1. **Blank Pages on New Routes**

**Problem**: The new routes (`/feedback`, `/generation`, `/realtime`, `/ingestion`) were showing blank pages.

**Root Causes Identified**:
1. **TypeScript compilation errors** preventing the build
2. **Missing proxy configuration** for backend API routes
3. **Component import/export issues**

**Solutions Applied**:

#### A. Fixed TypeScript Compilation Errors
- Removed unused imports (`location`, `AreaChart`, `Area`, `BarChart`, `Bar`)
- Ensured proper import statements without unused variables

#### B. Updated Vite Proxy Configuration
Updated `vite.config.ts` to proxy all backend routes:

```typescript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false
  },
  '/generate': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false
  },
  '/ingest': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false
  },
  '/execute': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false
  },
  '/analytics': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false
  },
  '/healing': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false
  },
  '/health': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false
  }
}
```

#### C. Component Structure Fixes
- Ensured all components have proper TypeScript interfaces
- Added console.log statements for debugging
- Created simplified versions for testing

## How to Test the Frontend

### 1. **Start the Backend Server**
```bash
# In the main project directory
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. **Start the Frontend Development Server**
```bash
# In the frontend directory
cd frontend
npm run dev
```

### 3. **Access the Application**
- Open browser to `http://localhost:3001` (or the port shown in console)
- Navigate through all routes to verify they're working:
  - `/coverage` ✅ (existing)
  - `/failures` ✅ (existing)  
  - `/analytics` ✅ (existing)
  - `/risk` ✅ (existing)
  - `/feedback` ✅ (new - Feedback & Learning)
  - `/generation` ✅ (new - Test Generation)
  - `/realtime` ✅ (new - Real-Time Testing)
  - `/ingestion` ✅ (new - Data Ingestion)
  - `/test` ✅ (debugging route)

## Debugging Steps

### 1. **Check Browser Console**
All components now include `console.log` statements:
```javascript
console.log('ComponentName component is rendering');
```

### 2. **Verify API Connectivity**
Check Network tab in browser dev tools for:
- API calls being made to correct endpoints
- Proper response status codes
- CORS issues (should be resolved with proxy)

### 3. **Component Loading Issues**
If components still show blank:
1. Check browser console for JavaScript errors
2. Verify component exports/imports are correct
3. Test with simplified components first

### 4. **Build Issues**
If build fails:
```bash
npm run build
```
- Fix any TypeScript errors shown
- Check for unused imports
- Verify all dependencies are installed

## Current Status

✅ **All Routes Working**: All 8 routes now render correctly
✅ **Proxy Configuration**: Backend API calls properly routed  
✅ **TypeScript Compilation**: No compilation errors
✅ **Component Structure**: All components follow same pattern as working ones
✅ **Navigation**: All routes added to sidebar navigation

## Next Steps

### 1. **Remove Debug Components**
Once testing is complete, remove the simple test components:
- `TestView.tsx`
- `TestGenerationViewSimple.tsx` 
- `FeedbackViewSimple.tsx`
- `RealTimeTestingViewSimple.tsx`
- `IngestionViewSimple.tsx`

### 2. **Backend Integration Testing**
Test each component with actual backend:
1. Start backend server first
2. Test API endpoints individually
3. Verify data flow and error handling

### 3. **Production Build**
```bash
npm run build
```
Deploy the built files from the `build/` directory.

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: Check import paths and ensure all files exist

### Issue: Blank page with no console errors  
**Solution**: Check if component is properly exported and imported in routing

### Issue: API calls failing
**Solution**: Verify backend is running and proxy configuration is correct

### Issue: TypeScript compilation errors
**Solution**: Fix unused imports and type mismatches

### Issue: Styling not applied
**Solution**: Ensure Tailwind CSS classes are properly included and built