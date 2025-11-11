import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tbasgihsryuxotrpyrsz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiYXNnaWhzcnl1eG90cnB5cnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NDIxMTgsImV4cCI6MjA3ODMxODExOH0.CmXja3H1rc6oMZxUSaqxIWkM3SbUGIC-xfzvXENJ_X0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
