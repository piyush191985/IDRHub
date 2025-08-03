# Supabase Storage Setup Guide

## Problem
Currently, images uploaded in the "Add Property" form are being stored in localStorage instead of Supabase Storage. This means:
- Images are only accessible in the current browser session
- Images are not persisted to the database or cloud storage
- Other users cannot see the images
- Images are lost when the browser is cleared

## Solution
Follow these steps to properly set up Supabase Storage for image uploads:

### Step 1: Create Storage Buckets

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**

#### Create the "properties" bucket:
- **Bucket Name**: `properties`
- **Public bucket**: ✅ Yes
- **File size limit**: 10MB
- **Allowed MIME types**: `image/*`

#### Create the "avatars" bucket:
- **Bucket Name**: `avatars`
- **Public bucket**: ✅ Yes
- **File size limit**: 5MB
- **Allowed MIME types**: `image/*`

### Step 2: Configure Storage Policies

After creating the buckets, you need to set up Row Level Security (RLS) policies:

1. Go to **Storage** > **Policies** tab
2. For each bucket (`properties` and `avatars`), create the following policies:

#### Policy 1: Public Uploads
- **Policy Name**: `Public Uploads`
- **Allowed operations**: `INSERT`
- **Target roles**: `public`
- **Using expression**: `true`
- **With check expression**: `true`

#### Policy 2: Public Viewing
- **Policy Name**: `Public Viewing`
- **Allowed operations**: `SELECT`
- **Target roles**: `public`
- **Using expression**: `true`

#### Policy 3: Authenticated Deletes
- **Policy Name**: `Authenticated Deletes`
- **Allowed operations**: `DELETE`
- **Target roles**: `authenticated`
- **Using expression**: `true`

### Step 3: Alternative - Disable RLS (Temporary)

If you're having trouble with policies, you can temporarily disable RLS:

1. Go to **Storage** > **Settings**
2. Find **"Row Level Security (RLS)"**
3. Toggle it **OFF**
4. Test uploading a file
5. If it works, you can leave RLS off for now, or re-enable it with proper policies

### Step 4: Test the Setup

1. Start your development server: `npm run dev`
2. Go to the "Add Property" page
3. Click the **"Test Storage"** button (yellow button in the header)
4. Check the browser console for test results
5. Try uploading an image in step 3 of the property form

### Step 5: Verify Upload

After uploading an image:
1. Check the browser console for upload logs
2. Go to your Supabase dashboard > Storage > properties bucket
3. You should see the uploaded image file
4. The image URL in the database should be a full Supabase Storage URL

## Troubleshooting

### Common Issues:

1. **"Bucket not found" error**
   - Make sure you created the buckets with exact names: `properties` and `avatars`
   - Check that you're in the correct Supabase project

2. **"Access denied" error**
   - Check that the buckets are set to "Public"
   - Verify RLS policies are configured correctly
   - Try disabling RLS temporarily

3. **"File too large" error**
   - Check the file size limits in bucket settings
   - Reduce image size before upload

4. **Images still not showing**
   - Check that the image URLs in the database are full Supabase Storage URLs
   - Verify the `getFileUrl` function is working correctly

### Debug Commands:

You can run these in the browser console to debug:

```javascript
// Test storage connectivity
import { testSupabaseStorage } from './src/utils/fileUpload';
testSupabaseStorage().then(console.log);

// Check localStorage contents
import { debugLocalStorage } from './src/utils/fileUpload';
debugLocalStorage();

// Process upload queue
import { processUploadQueue } from './src/utils/fileUpload';
processUploadQueue();
```

## Expected Behavior After Setup

1. **Images upload directly to Supabase Storage**
2. **Image URLs in database are full Supabase Storage URLs** (e.g., `https://your-project.supabase.co/storage/v1/object/public/properties/filename.jpg`)
3. **Images are accessible to all users**
4. **Images persist across browser sessions**
5. **Images are properly displayed in property listings**

## Code Changes Made

The following improvements have been made to the file upload system:

1. **Primary upload to Supabase Storage** - Images now try to upload to Supabase Storage first
2. **Better error handling** - More detailed logging and error messages
3. **Upload queue system** - Failed uploads are queued for retry
4. **Improved URL handling** - Better support for different URL formats
5. **Fallback mechanism** - localStorage is still used as a fallback if Supabase Storage fails

## Next Steps

After completing this setup:

1. Test the image upload functionality
2. Remove the "Test Storage" button from the AddProperty page
3. Consider implementing image optimization (resizing, compression)
4. Add image deletion functionality when properties are deleted
5. Implement proper error handling for failed uploads 