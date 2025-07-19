# Google AdSense Setup Guide

## 🎯 Overview

This guide will help you set up Google AdSense ads in your "Who is Right?" app.

## 📋 Prerequisites

1. Google AdSense account (https://www.google.com/adsense)
2. Your website must be live and accessible
3. Original content (not copied from other sites)
4. Privacy policy and terms of service pages

## 🔧 Setup Steps

### 1. Get Your AdSense Publisher ID

1. Go to [Google AdSense](https://www.google.com/adsense)
2. Sign in with your Google account
3. Complete the application process
4. Once approved, you'll get a Publisher ID like: `ca-pub-1234567890123456`

### 2. Update the Code

Replace the placeholder values in these files:

#### In `public/index.html`:

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ACTUAL_PUBLISHER_ID"
  crossorigin="anonymous"
></script>
```

#### In `src/components/AdBox.tsx`:

```typescript
data-ad-client="ca-pub-YOUR_ACTUAL_PUBLISHER_ID"
```

#### In `src/App.tsx`:

```typescript
<AdBox adSlot="YOUR_ACTUAL_AD_SLOT_ID" className="max-w-4xl mx-auto" />
```

### 3. Create Ad Units

1. In AdSense dashboard, go to "Ads" → "By ad unit"
2. Click "Create new ad unit"
3. Choose ad format (recommended: "Display ads")
4. Set responsive sizing
5. Copy the ad unit code
6. Extract the `data-ad-slot` value and use it in your `AdBox` component

### 4. Test Your Ads

1. Deploy your app to production
2. Wait 24-48 hours for AdSense to start serving ads
3. Check the AdSense dashboard for impressions and earnings

## 📱 Ad Placement Strategy

### Current Implementation:

- **Location**: After the debate result
- **Trigger**: Only shows when there's a result (not during loading)
- **Responsive**: Adapts to mobile and desktop screens
- **Styling**: Matches your app's dark theme

### Additional Placement Options:

You can add more ad placements by:

1. **Header Ad**: Add before the main content
2. **Sidebar Ad**: For desktop layouts
3. **Footer Ad**: At the bottom of the page
4. **In-content Ad**: Between form sections

## 🎨 Customization

### Styling Options:

The ad container uses these CSS classes:

- `.ad-container`: Main container styling
- Responsive design for mobile/desktop
- Matches your app's color scheme

### Ad Formats:

- **Display ads**: Standard banner ads
- **Responsive ads**: Automatically adjust to container size
- **In-article ads**: Blend with content
- **In-feed ads**: Look like native content

## ⚠️ Important Notes

### AdSense Policies:

- Don't place too many ads (max 3 per page recommended)
- Ensure ads don't interfere with user experience
- Don't click your own ads (policy violation)
- Wait for approval before ads start showing

### Performance:

- Ads load asynchronously to not block your app
- Error handling prevents crashes if ads fail to load
- Responsive design ensures good mobile experience

### Revenue Optimization:

- Test different ad placements
- Monitor user engagement metrics
- Consider A/B testing ad positions
- Focus on user experience over ad density

## 🚀 Deployment Checklist

- [ ] Replace `YOUR_PUBLISHER_ID` with actual AdSense ID
- [ ] Replace `YOUR_AD_SLOT_ID` with actual ad unit ID
- [ ] Deploy to production domain
- [ ] Submit site for AdSense review
- [ ] Wait for approval (usually 1-2 weeks)
- [ ] Monitor ad performance in dashboard

## 📊 Analytics Integration

The app already includes Firebase Analytics to track:

- Page views
- User interactions
- Ad impressions (via AdSense dashboard)
- Revenue metrics

## 🆘 Troubleshooting

### Common Issues:

1. **Ads not showing**: Check if AdSense is approved
2. **Wrong ad size**: Verify responsive settings
3. **Loading errors**: Check browser console for errors
4. **No revenue**: Ensure sufficient traffic and engagement

### Support:

- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community](https://support.google.com/adsense/community)
- [Policy Guidelines](https://support.google.com/adsense/answer/48182)
