# Video Hosting Options Guide

Your video file is currently **95MB** which causes slow loading, especially in Safari. Here are professional solutions:

---

## Option 1: YouTube Embed (Recommended - FREE & Easy)

### **Benefits:**
✅ FREE hosting
✅ Works perfectly in Safari, Chrome, all browsers
✅ Automatic adaptive streaming (adjusts quality based on connection)
✅ Professional player with built-in controls
✅ Mobile-optimized
✅ No bandwidth costs

### **Step-by-Step Instructions:**

#### **1. Upload to YouTube**

1. Go to [YouTube Studio](https://studio.youtube.com)
2. Click **Create** (camera icon) → **Upload videos**
3. Select your file: `public/idea-to-market-journey.mp4`
4. Fill in details:
   - **Title**: "Research to Market Platform Demo"
   - **Description**: "Transform academic research into market opportunities"
   - **Visibility**: Choose one:
     - **Public** - Anyone can find it
     - **Unlisted** - Only people with the link can watch (recommended for business)
     - **Private** - Only you can see it
5. Click **Publish**

#### **2. Get the Video ID**

After upload, your URL will look like:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
                                  ↑ This is your VIDEO_ID
```

Copy the part after `v=`

#### **3. Update Your Code**

The code is already updated in `Hero.tsx`. Just replace `YOUR_VIDEO_ID`:

**Line 81** in `src/components/landing/Hero.tsx`:
```tsx
src="https://www.youtube.com/embed/YOUR_VIDEO_ID?rel=0&modestbranding=1"
```

Change to:
```tsx
src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
```
(Replace `dQw4w9WgXcQ` with your actual video ID)

#### **4. Done!**

Refresh your website. The video will now:
- Load instantly
- Work in all browsers
- Adapt to mobile screens
- Have professional YouTube controls

---

### **YouTube Embed Parameters Explained:**

Current URL: `?rel=0&modestbranding=1`

**Available options:**
```
?rel=0                    - Don't show related videos at end
&modestbranding=1         - Minimal YouTube branding
&autoplay=1               - Auto-play (not recommended)
&mute=1                   - Start muted (required for autoplay)
&controls=1               - Show player controls (default)
&start=10                 - Start at 10 seconds
&end=60                   - End at 60 seconds
&loop=1                   - Loop the video
&playlist=VIDEO_ID        - Required for loop to work
```

**Example for auto-play muted:**
```tsx
src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&rel=0"
```

---

## Option 2: Cloudflare Stream (Professional CDN)

### **Benefits:**
✅ Fast global delivery
✅ Adaptive bitrate streaming
✅ No YouTube branding
✅ Analytics included
✅ DRM protection available

### **Cost:**
- **$1/1,000 minutes** of video stored
- **$1/1,000 minutes** delivered to viewers
- Very cheap for small traffic

### **Step-by-Step:**

#### **1. Sign Up for Cloudflare**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Sign up or log in
3. Go to **Stream** in the sidebar

#### **2. Upload Video**

1. Click **Upload Video**
2. Select `idea-to-market-journey.mp4`
3. Wait for processing (5-10 minutes)
4. Copy the video ID from the URL

#### **3. Get Embed Code**

Cloudflare will give you code like:
```html
<stream src="a1b2c3d4e5f6g7h8" controls></stream>
<script data-cfasync="false" defer type="text/javascript" src="https://embed.cloudflarestream.com/embed/sdk.latest.js"></script>
```

#### **4. Update Hero.tsx**

Replace the YouTube iframe with Cloudflare Stream:

```tsx
{/* Cloudflare Stream Video */}
<div className="relative rounded-lg overflow-hidden">
  <stream
    src="YOUR_CLOUDFLARE_VIDEO_ID"
    controls
    preload="auto"
    className="w-full rounded-lg"
  />
  <script
    data-cfasync="false"
    defer
    type="text/javascript"
    src="https://embed.cloudflarestream.com/embed/sdk.latest.js"
  />
</div>
```

---

## Option 3: AWS S3 + CloudFront (Enterprise)

### **Benefits:**
✅ Full control over video
✅ Custom domain
✅ Advanced analytics
✅ Scalable to millions of viewers

### **Cost:**
- **S3 Storage**: $0.023/GB/month (~$2.19/month for your 95MB video)
- **CloudFront Delivery**: $0.085/GB transferred (~$8.50 for 100GB bandwidth)

### **Step-by-Step:**

#### **1. Create S3 Bucket**

```bash
# Install AWS CLI if you haven't
brew install awscli

# Configure AWS credentials
aws configure

# Create bucket
aws s3 mb s3://r2m-marketplace-videos --region us-east-1

# Upload video
aws s3 cp /Users/geetadesaraju/bootcamp2510/your_workspace/sprint4/r2m-marketplace/public/idea-to-market-journey.mp4 s3://r2m-marketplace-videos/idea-to-market-journey.mp4 --acl public-read
```

#### **2. Create CloudFront Distribution**

1. Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront)
2. Click **Create Distribution**
3. **Origin Domain**: Select your S3 bucket
4. **Viewer Protocol Policy**: Redirect HTTP to HTTPS
5. Click **Create Distribution**
6. Wait 10-15 minutes for deployment
7. Copy the **Distribution Domain Name** (e.g., `d1234abcd.cloudfront.net`)

#### **3. Update Hero.tsx**

```tsx
<video
  className="w-full rounded-lg"
  controls
  preload="metadata"
  playsInline
>
  <source
    src="https://d1234abcd.cloudfront.net/idea-to-market-journey.mp4"
    type="video/mp4"
  />
</video>
```

---

## Comparison Table

| Feature | Local Video | YouTube | Cloudflare | AWS S3+CF |
|---------|-------------|---------|------------|-----------|
| **Cost** | Free (bandwidth) | FREE | ~$2/month | ~$10/month |
| **Setup Time** | 0 min | 5 min | 10 min | 30 min |
| **Browser Support** | ⚠️ Safari issues | ✅ Perfect | ✅ Perfect | ✅ Perfect |
| **Load Speed** | 🐌 95MB slow | ⚡ Instant | ⚡ Instant | ⚡ Fast |
| **Mobile** | ⚠️ Large file | ✅ Adaptive | ✅ Adaptive | ⚠️ Full file |
| **Branding** | None | YouTube logo | None | None |
| **Analytics** | None | ✅ Built-in | ✅ Built-in | Manual |

---

## Recommendation

### **For MVP/Startup: Use YouTube Embed**
- Takes 5 minutes
- FREE forever
- Works perfectly everywhere
- Professional quality

### **For Production/Enterprise: Use Cloudflare Stream**
- Clean, no branding
- Fast global delivery
- Very affordable ($1-2/month)
- Professional analytics

### **Avoid Local Hosting if:**
- Video is >10MB
- You expect mobile traffic
- You care about Safari users

---

## Quick Start (YouTube - 5 Minutes)

1. **Upload** video to YouTube (set to Unlisted)
2. **Copy** video ID from URL: `youtube.com/watch?v=VIDEO_ID`
3. **Edit** `src/components/landing/Hero.tsx` line 81:
   ```tsx
   src="https://www.youtube.com/embed/YOUR_VIDEO_ID?rel=0&modestbranding=1"
   ```
4. **Replace** `YOUR_VIDEO_ID` with your actual ID
5. **Refresh** browser - Done! ✅

---

## Need Help?

**Already uploaded to YouTube?** Just give me the video ID and I'll update the code for you.

**Want to use Cloudflare or AWS?** Let me know and I'll help you set it up step by step.
