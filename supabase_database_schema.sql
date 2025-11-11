-- ========================================
-- 美食分享网站 - Supabase 数据库设计
-- 包含 5 张数据表
-- ========================================

-- 1. 创建用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建菜谱表
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  cooking_time INT,
  difficulty VARCHAR(20) CHECK (difficulty IN ('简单', '中等', '困难')),
  category VARCHAR(50),
  image_url TEXT,
  likes_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建收藏表
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id) -- 防止重复收藏
);

-- 5. 创建标签表
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  tag_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 创建索引（提升查询性能）
-- ========================================
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_comments_recipe_id ON comments(recipe_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_recipe_id ON favorites(recipe_id);
CREATE INDEX idx_tags_recipe_id ON tags(recipe_id);
CREATE INDEX idx_tags_tag_name ON tags(tag_name);

-- ========================================
-- 启用行级安全策略（RLS）
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 创建公开访问策略（任何人可读）
-- ========================================
CREATE POLICY "公开读取用户" ON users FOR SELECT USING (true);
CREATE POLICY "公开读取菜谱" ON recipes FOR SELECT USING (true);
CREATE POLICY "公开读取评论" ON comments FOR SELECT USING (true);
CREATE POLICY "公开读取收藏" ON favorites FOR SELECT USING (true);
CREATE POLICY "公开读取标签" ON tags FOR SELECT USING (true);

-- ========================================
-- 创建插入策略（已认证用户可写）
-- ========================================
CREATE POLICY "允许插入菜谱" ON recipes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "允许插入评论" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "允许插入收藏" ON favorites FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "允许插入标签" ON tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- 创建更新/删除策略（用户只能操作自己的数据）
-- ========================================
CREATE POLICY "用户更新自己的菜谱" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户删除自己的菜谱" ON recipes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "用户删除自己的评论" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "用户删除自己的收藏" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 创建自动更新 updated_at 的触发器
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 插入测试数据（可选）
-- ========================================

-- 插入测试用户
INSERT INTO users (username, email, bio) VALUES
  ('美食达人', 'foodie@example.com', '热爱烹饪，分享美味'),
  ('厨艺新手', 'chef@example.com', '正在学习做菜中');

-- 插入测试菜谱
INSERT INTO recipes (user_id, title, description, ingredients, steps, cooking_time, difficulty, category, image_url) VALUES
  (
    (SELECT id FROM users WHERE username = '美食达人'),
    '宫保鸡丁',
    '经典川菜，麻辣鲜香',
    '鸡胸肉 300g, 花生米 100g, 干辣椒 10个, 花椒 1勺, 葱姜蒜适量',
    '1. 鸡肉切丁腌制\n2. 热油炒花生米\n3. 炒鸡丁至变色\n4. 加入调料翻炒\n5. 出锅前撒花生米',
    30,
    '中等',
    '川菜',
    'https://images.unsplash.com/photo-1603073203044-4a0ff1e6d15c'
  ),
  (
    (SELECT id FROM users WHERE username = '厨艺新手'),
    '番茄炒蛋',
    '简单快手的家常菜',
    '番茄 2个, 鸡蛋 3个, 葱花适量, 盐, 糖',
    '1. 鸡蛋打散\n2. 番茄切块\n3. 炒蛋盛出\n4. 炒番茄\n5. 加入鸡蛋翻炒',
    15,
    '简单',
    '家常菜',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
  );

-- 插入测试评论
INSERT INTO comments (recipe_id, user_id, content, rating) VALUES
  (
    (SELECT id FROM recipes WHERE title = '宫保鸡丁'),
    (SELECT id FROM users WHERE username = '厨艺新手'),
    '太好吃了！按照步骤做出来很成功',
    5
  );

-- 插入测试收藏
INSERT INTO favorites (user_id, recipe_id) VALUES
  (
    (SELECT id FROM users WHERE username = '厨艺新手'),
    (SELECT id FROM recipes WHERE title = '宫保鸡丁')
  );

-- 插入测试标签
INSERT INTO tags (recipe_id, tag_name) VALUES
  ((SELECT id FROM recipes WHERE title = '宫保鸡丁'), '川菜'),
  ((SELECT id FROM recipes WHERE title = '宫保鸡丁'), '下饭菜'),
  ((SELECT id FROM recipes WHERE title = '宫保鸡丁'), '宴客菜'),
  ((SELECT id FROM recipes WHERE title = '番茄炒蛋'), '快手菜'),
  ((SELECT id FROM recipes WHERE title = '番茄炒蛋'), '家常菜'),
  ((SELECT id FROM recipes WHERE title = '番茄炒蛋'), '新手友好');
