import { supabase } from '../lib/supabase';

// Utility function for handling file uploads to Supabase Storage
export const uploadFileLocally = async (file: File, folder: 'properties' | 'avatars'): Promise<string> => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomId}.${fileExtension}`;
    
    // Try to upload to Supabase Storage first
    try {
      console.log('Attempting to upload to Supabase Storage...', { folder, filename, fileSize: file.size });
      
      const { data, error } = await supabase.storage
        .from(folder)
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.warn('Supabase Storage upload failed:', error);
        throw error;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(folder)
        .getPublicUrl(filename);

      console.log('Successfully uploaded to Supabase Storage:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (storageError) {
      console.warn('Supabase Storage upload failed, using localStorage fallback:', storageError);
      
      // Store in localStorage as fallback, but also store the file data for potential later upload
      const localPath = await uploadToLocalStorage(file, folder, filename);
      
      // Try to queue the file for later upload to Supabase Storage
      queueFileForUpload(file, folder, filename);
      
      return localPath;
    }
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
  }
};

// Queue files for later upload to Supabase Storage
const queueFileForUpload = (file: File, folder: string, filename: string) => {
  try {
    const uploadQueue = JSON.parse(localStorage.getItem('uploadQueue') || '[]');
    uploadQueue.push({
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      },
      folder,
      filename,
      timestamp: Date.now(),
      attempts: 0
    });
    localStorage.setItem('uploadQueue', JSON.stringify(uploadQueue));
    console.log('File queued for later upload:', filename);
  } catch (error) {
    console.warn('Failed to queue file for upload:', error);
  }
};

// Process upload queue (can be called periodically or on app startup)
export const processUploadQueue = async () => {
  try {
    const uploadQueue = JSON.parse(localStorage.getItem('uploadQueue') || '[]');
    if (uploadQueue.length === 0) return;

    console.log('Processing upload queue...', uploadQueue.length, 'files');

    for (let i = uploadQueue.length - 1; i >= 0; i--) {
      const item = uploadQueue[i];
      
      // Skip if too many attempts
      if (item.attempts >= 3) {
        console.log('Skipping file after too many attempts:', item.filename);
        uploadQueue.splice(i, 1);
        continue;
      }

      try {
        // Try to get the file from localStorage
        const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
        const fileData = uploadedFiles.find((f: any) => f.path === `/uploads/${item.folder}/${item.filename}`);
        
        if (!fileData || !fileData.content) {
          console.log('File not found in localStorage, removing from queue:', item.filename);
          uploadQueue.splice(i, 1);
          continue;
        }

        // Convert base64 back to File object
        const response = await fetch(fileData.content);
        const blob = await response.blob();
        const file = new File([blob], item.filename, { type: item.file.type });

        // Try to upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(item.folder)
          .upload(item.filename, file);

        if (error) {
          console.warn('Failed to upload queued file:', error);
          item.attempts++;
        } else {
          console.log('Successfully uploaded queued file:', item.filename);
          uploadQueue.splice(i, 1);
        }
      } catch (error) {
        console.warn('Error processing queued file:', error);
        item.attempts++;
      }
    }

    localStorage.setItem('uploadQueue', JSON.stringify(uploadQueue));
  } catch (error) {
    console.error('Error processing upload queue:', error);
  }
};

// Fallback function for local storage
const uploadToLocalStorage = async (file: File, folder: string, filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Validate that we have a result
        if (!e.target || !e.target.result) {
          throw new Error('FileReader failed to read file content');
        }
        
        // Create the file path
        const filePath = `/uploads/${folder}/${filename}`;
        
        // Check file size - localStorage has ~5-10MB total limit
        if (file.size > 1 * 1024 * 1024) { // 1MB limit per file
          throw new Error('File size too large for localStorage (max 1MB per file)');
        }
        
        // Check total localStorage usage and clean up if needed
        const existingFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
        const totalSize = existingFiles.reduce((sum: number, file: any) => sum + (file.size || 0), 0);
        let newTotalSize = totalSize + file.size;
        
        // If we're approaching the limit (4MB), remove old files
        if (newTotalSize > 4 * 1024 * 1024) {
          console.log('localStorage approaching limit, cleaning up old files...');
          // Remove oldest files until we're under 2MB
          while (existingFiles.length > 0 && newTotalSize > 2 * 1024 * 1024) {
            const removedFile = existingFiles.shift();
            if (removedFile) {
              newTotalSize -= (removedFile.size || 0);
            }
          }
        }
        
        // Store in localStorage as a workaround
        const fileData = {
          path: filePath,
          name: filename,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          content: e.target.result, // Base64 content
          timestamp: Date.now() // Add timestamp for cleanup
        };
        
        console.log('Uploading to localStorage:', {
          path: filePath,
          size: file.size,
          type: file.type,
          contentLength: typeof fileData.content === 'string' ? fileData.content.length : 0,
          totalFiles: existingFiles.length + 1,
          totalSize: newTotalSize
        });
        
        // Try to store in localStorage
        try {
          existingFiles.push(fileData);
          localStorage.setItem('uploadedFiles', JSON.stringify(existingFiles));
          console.log('Successfully uploaded to localStorage:', filePath);
          resolve(filePath);
        } catch (storageError) {
          // If localStorage is still full, try to clear more files
          console.warn('localStorage still full, clearing more files...');
          existingFiles.splice(0, Math.floor(existingFiles.length / 2)); // Remove half the files
          existingFiles.push(fileData);
          localStorage.setItem('uploadedFiles', JSON.stringify(existingFiles));
          console.log('Successfully uploaded to localStorage after cleanup:', filePath);
          resolve(filePath);
        }
      } catch (error) {
        console.error('Error uploading to localStorage:', error);
        reject(new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Failed to read file content'));
    };
    
    reader.onabort = () => {
      console.error('FileReader aborted');
      reject(new Error('File reading was aborted'));
    };
    
    // Read file as data URL (base64)
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error starting file read:', error);
      reject(new Error('Failed to start file reading'));
    }
  });
};

// Function to get file URL from stored path
export const getFileUrl = (filePath: string): string => {
  // Check if it's already a full URL (Supabase Storage URL)
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  // Check if it's a Supabase Storage path (starts with /storage/v1/object/public/)
  if (filePath.startsWith('/storage/v1/object/public/')) {
    // Convert to full URL
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
    return `${supabaseUrl}${filePath}`;
  }
  
  // For local files, retrieve from localStorage
  try {
    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    const fileData = uploadedFiles.find((file: any) => file.path === filePath);
    
    if (fileData && fileData.content) {
      // Check if the content is a valid data URL
      if (fileData.content.startsWith('data:image/')) {
        return fileData.content; // Return the base64 data URL
      } else {
        console.warn('Invalid data URL format for file:', filePath);
      }
    } else {
      // File not found in localStorage - this is normal for new uploads
      console.log('File not found in localStorage:', filePath);
    }
  } catch (error) {
    console.warn('Error reading from local storage:', error);
  }
  
  // Fallback to a placeholder image
  return 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800';
};

// Function to delete a file
export const deleteFileLocally = async (filePath: string): Promise<void> => {
  try {
    // Try Supabase Storage first
    if (filePath.includes('supabase.co')) {
      const urlParts = filePath.split('/');
      const filename = urlParts[urlParts.length - 1];
      const folder = filePath.includes('/properties/') ? 'properties' : 'avatars';
      
      const { error } = await supabase.storage
        .from(folder)
        .remove([filename]);

      if (error) {
        console.error('Supabase Storage deletion error:', error);
      }
    } else {
      // Delete from local storage
      const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
      const filteredFiles = uploadedFiles.filter((file: any) => file.path !== filePath);
      localStorage.setItem('uploadedFiles', JSON.stringify(filteredFiles));
    }
  } catch (error) {
    console.error('File deletion error:', error);
  }
}; 

// Debug function to check localStorage contents
export const debugLocalStorage = () => {
  try {
    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    console.log('LocalStorage contents:', {
      totalFiles: uploadedFiles.length,
      files: uploadedFiles.map((file: any) => ({
        path: file.path,
        name: file.name,
        size: file.size,
        type: file.type,
        hasContent: !!file.content,
        contentLength: typeof file.content === 'string' ? file.content.length : 0
      }))
    });
    return uploadedFiles;
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return [];
  }
};

// Function to clear localStorage (for testing)
export const clearLocalStorage = () => {
  localStorage.removeItem('uploadedFiles');
  console.log('Cleared uploadedFiles from localStorage');
};

// Function to validate video URLs
export const validateVideoUrl = (url: string): { isValid: boolean; type: 'youtube' | 'instagram' | 'unknown'; message: string } => {
  if (!url) {
    return { isValid: false, type: 'unknown', message: 'URL is required' };
  }

  try {
    // YouTube URL validation
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (videoIdMatch) {
        return { isValid: true, type: 'youtube', message: 'Valid YouTube URL' };
      } else {
        return { isValid: false, type: 'youtube', message: 'Invalid YouTube URL format' };
      }
    }
    
    // Instagram URL validation
    if (url.includes('instagram.com') && (url.includes('reel') || url.includes('p/'))) {
      const postIdMatch = url.match(/(?:instagram\.com\/reel\/|instagram\.com\/p\/)([a-zA-Z0-9_-]+)/);
      if (postIdMatch) {
        return { isValid: true, type: 'instagram', message: 'Valid Instagram URL' };
      } else {
        return { isValid: false, type: 'instagram', message: 'Invalid Instagram URL format' };
      }
    }
    
    return { isValid: false, type: 'unknown', message: 'Unsupported video platform' };
  } catch (error) {
    return { isValid: false, type: 'unknown', message: 'Invalid URL format' };
  }
};

// Test function to check Supabase Storage accessibility
export const testSupabaseStorage = async () => {
  try {
    console.log('Testing Supabase Storage accessibility...');
    
    // Try to list files in properties bucket
    const { data: propertiesList, error: propertiesError } = await supabase.storage
      .from('properties')
      .list();
    
    console.log('Properties bucket list result:', { data: propertiesList, error: propertiesError });
    
    // Try to list files in avatars bucket
    const { data: avatarsList, error: avatarsError } = await supabase.storage
      .from('avatars')
      .list();
    
    console.log('Avatars bucket list result:', { data: avatarsList, error: avatarsError });
    
    // Test upload permissions by trying to upload a small test file
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('properties')
      .upload(`test-${Date.now()}.txt`, testFile);
    
    console.log('Test upload result:', { data: uploadData, error: uploadError });
    
    // If upload succeeded, clean up the test file
    if (uploadData && !uploadError) {
      const { error: deleteError } = await supabase.storage
        .from('properties')
        .remove([uploadData.path]);
      console.log('Test file cleanup result:', { error: deleteError });
    }
    
    return {
      properties: { data: propertiesList, error: propertiesError },
      avatars: { data: avatarsList, error: avatarsError },
      upload: { data: uploadData, error: uploadError }
    };
  } catch (error) {
    console.error('Supabase Storage test error:', error);
    return { error };
  }
}; 