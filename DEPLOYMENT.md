# Deployment Guide

## 🚀 Deploying to Firebase Hosting

### **Step 1: Build the App**

```bash
npm run build
```

### **Step 2: Deploy to Firebase**

```bash
firebase deploy --only hosting
```

## 🔧 Routing Configuration

### **What I Fixed:**

1. **Firebase Rewrites**: Added to `firebase.json`

   - All routes now redirect to `index.html`
   - Enables client-side routing

2. **\_redirects File**: Created in `public/`

   - Backup routing solution
   - Handles direct URL access

3. **Vite Configuration**: Updated `vite.config.ts`
   - Proper build output
   - Optimized for production

### **How It Works:**

- **Direct URL Access**: `/how-it-works` now works
- **Browser Refresh**: No more 404 errors
- **Deep Linking**: All routes accessible directly
- **SEO Friendly**: Proper URL structure maintained

## 📋 Deployment Checklist

### **Before Deploying:**

- [ ] Run `npm run build`
- [ ] Test locally with `npm run preview`
- [ ] Check all routes work: `/`, `/how-it-works`

### **After Deploying:**

- [ ] Test: `whoisright.app`
- [ ] Test: `whoisright.app/how-it-works`
- [ ] Test: Browser refresh on `/how-it-works`
- [ ] Check mobile navigation

## 🎯 Expected Results

After deployment, these URLs should work:

- ✅ `https://whoisright.app/` (main app)
- ✅ `https://whoisright.app/how-it-works` (how it works page)
- ✅ Direct navigation to any route
- ✅ Browser refresh on any page

## 🔍 Troubleshooting

### **If routes still don't work:**

1. **Clear Firebase cache:**

   ```bash
   firebase hosting:clear
   firebase deploy --only hosting
   ```

2. **Check Firebase Console:**

   - Go to Hosting section
   - Verify custom domain is connected
   - Check for any errors

3. **Test with curl:**
   ```bash
   curl -I https://whoisright.app/how-it-works
   # Should return 200, not 404
   ```

## 📱 Mobile Testing

Test these scenarios:

- [ ] Navigate to `/how-it-works` from main page
- [ ] Direct access to `/how-it-works`
- [ ] Browser refresh on `/how-it-works`
- [ ] Back/forward navigation
- [ ] Mobile hamburger menu navigation

## 🚨 Common Issues

### **404 Errors:**

- Solution: Deploy with updated `firebase.json`
- Wait 5-10 minutes for propagation

### **Caching Issues:**

- Solution: Clear browser cache
- Or use incognito mode

### **SSL Certificate:**

- Wait 24-48 hours for full SSL setup
- Check Firebase Console for status
