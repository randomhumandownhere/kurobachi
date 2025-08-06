import { createClient } from '@supabase/supabase-js'

// its okey btw :>
const supabaseUrl = 'https://mlixvgdnczwqkjqmazcn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saXh2Z2RuY3p3cWtqcW1hemNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzM0ODIsImV4cCI6MjA2OTk0OTQ4Mn0.yi2IfiWZHsE4LC7i_QWFRd5VnSiHcbeJ-ELte2K23RA'

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: true } });

export default supabase;