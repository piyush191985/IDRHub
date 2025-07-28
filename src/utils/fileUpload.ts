import { supabase } from '../lib/supabase';

// Utility function for handling file uploads to Supabase Storage
export const uploadFileLocally = async (file: File, folder: 'properties' | 'avatars'): Promise<string> => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomId}.${fileExtension}`;
    
    // For now, use localStorage as primary method since Supabase Storage RLS is blocking access
    console.log('Using localStorage for file upload (Supabase Storage RLS issues)');
    return await uploadToLocalStorage(file, folder, filename);
    
    /* 
    // Try to upload to Supabase Storage first (commented out due to RLS issues)
    try {
      const { data, error } = await supabase.storage
        .from(folder)
        .upload(filename, file);

      if (error) {
        console.warn('Supabase Storage upload failed, falling back to local storage:', error);
        throw error; // This will trigger the fallback
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(folder)
        .getPublicUrl(filename);

      return urlData.publicUrl;
    } catch (storageError) {
      // Fallback to local storage if Supabase Storage fails
      console.log('Using local storage fallback for file upload');
      return await uploadToLocalStorage(file, folder, filename);
    }
    */
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
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
  // Check if it's already a full URL
  if (filePath.startsWith('http')) {
    return filePath; // Return the URL and let the browser handle loading errors
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
    
    return {
      properties: { data: propertiesList, error: propertiesError },
      avatars: { data: avatarsList, error: avatarsError }
    };
  } catch (error) {
    console.error('Supabase Storage test error:', error);
    return { error };
  }
}; 