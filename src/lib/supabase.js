import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://bgqizcctelzuttlfmnve.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWl6Y2N0ZWx6dXR0bGZtbnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDkxODMsImV4cCI6MjA5NjU4NTE4M30.PWHkefef8-W_F4b8Jr5PxuRbZ4rdEaQXdN99uKKCMZo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
