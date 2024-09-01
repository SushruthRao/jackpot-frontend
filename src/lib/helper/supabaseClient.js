import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient('https://uqohijzctcqoqlubolsr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxb2hpanpjdGNxb3FsdWJvbHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwOTUwMjgsImV4cCI6MjA0MDY3MTAyOH0.7X5Ws7IilAtCeQbV6wTU2Zxtzb5P3dGmdG1rbyvja6w')


