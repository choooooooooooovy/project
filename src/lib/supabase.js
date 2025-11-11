import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY

let supabase

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('请在 .env 文件中配置 SUPABASE_URL 和 SUPABASE_ANON_KEY')
  // 创建一个空的客户端，避免应用崩溃
  supabase = null
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
