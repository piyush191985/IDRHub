#!/usr/bin/env node

/**
 * Supabase Storage Setup Helper Script
 * 
 * This script helps test and set up Supabase Storage for the estate application.
 * Run this script to check if your Supabase Storage is properly configured.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.log('Please make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorageSetup() {
  console.log('🔍 Testing Supabase Storage Setup...\n');

  try {
    // Test 1: Check if buckets exist
    console.log('1. Checking storage buckets...');
    
    const { data: propertiesList, error: propertiesError } = await supabase.storage
      .from('properties')
      .list();
    
    if (propertiesError) {
      console.log('❌ Properties bucket error:', propertiesError.message);
    } else {
      console.log('✅ Properties bucket accessible');
      console.log(`   Files in bucket: ${propertiesList?.length || 0}`);
    }

    const { data: avatarsList, error: avatarsError } = await supabase.storage
      .from('avatars')
      .list();
    
    if (avatarsError) {
      console.log('❌ Avatars bucket error:', avatarsError.message);
    } else {
      console.log('✅ Avatars bucket accessible');
      console.log(`   Files in bucket: ${avatarsList?.length || 0}`);
    }

    // Test 2: Try to upload a test file
    console.log('\n2. Testing file upload...');
    
    const testContent = 'This is a test file for Supabase Storage setup';
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('properties')
      .upload(`test-${Date.now()}.txt`, testFile);

    if (uploadError) {
      console.log('❌ Upload test failed:', uploadError.message);
      console.log('   This usually means the bucket policies are not configured correctly');
    } else {
      console.log('✅ Upload test successful');
      console.log(`   File uploaded: ${uploadData.path}`);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('properties')
        .remove([uploadData.path]);
      
      if (deleteError) {
        console.log('⚠️  Warning: Could not delete test file:', deleteError.message);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }

    // Test 3: Check public URL generation
    console.log('\n3. Testing public URL generation...');
    
    const { data: urlData } = supabase.storage
      .from('properties')
      .getPublicUrl('test-url.txt');
    
    console.log('✅ Public URL generation working');
    console.log(`   Example URL: ${urlData.publicUrl}`);

  } catch (error) {
    console.error('❌ Storage test failed:', error.message);
  }
}

async function showSetupInstructions() {
  console.log('\n📋 Setup Instructions:\n');
  
  console.log('If any tests failed, follow these steps:');
  console.log('');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Storage in the left sidebar');
  console.log('3. Create two buckets:');
  console.log('   - Name: "properties" (Public: Yes, Size limit: 10MB)');
  console.log('   - Name: "avatars" (Public: Yes, Size limit: 5MB)');
  console.log('');
  console.log('4. For each bucket, go to the Policies tab and create:');
  console.log('   - Public Uploads policy (INSERT, public, true)');
  console.log('   - Public Viewing policy (SELECT, public, true)');
  console.log('   - Authenticated Deletes policy (DELETE, authenticated, true)');
  console.log('');
  console.log('5. Alternative: Temporarily disable RLS in Storage > Settings');
  console.log('');
  console.log('6. Run this script again to verify the setup');
}

async function main() {
  console.log('🏠 Estate App - Supabase Storage Setup Helper\n');
  
  await testStorageSetup();
  await showSetupInstructions();
  
  console.log('\n✨ Setup complete! Check the results above.');
}

main().catch(console.error); 