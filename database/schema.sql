-- ============================================================
-- TTS Anak Pintar - Supabase Database Schema
-- ============================================================
-- Educational Crossword Puzzle Game for Indonesian Students
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS & PROFILES
-- ============================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  xp INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role, grade)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    (NEW.raw_user_meta_data->>'grade')::INTEGER
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PUZZLES
-- ============================================================

CREATE TABLE IF NOT EXISTS puzzles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  subject TEXT NOT NULL CHECK (subject IN ('islam', 'quran', 'hadith', 'arabic', 'english', 'general')),
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 6),
  grid_data JSONB NOT NULL,
  words JSONB NOT NULL,
  is_daily BOOLEAN NOT NULL DEFAULT false,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  source_metadata JSONB,
  play_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_puzzles_subject ON puzzles(subject);
CREATE INDEX idx_puzzles_grade ON puzzles(grade);
CREATE INDEX idx_puzzles_difficulty ON puzzles(difficulty);
CREATE INDEX idx_puzzles_daily ON puzzles(is_daily) WHERE is_daily = true;
CREATE INDEX idx_puzzles_approved ON puzzles(approved) WHERE approved = true;
CREATE INDEX idx_puzzles_created ON puzzles(created_at DESC);

-- ============================================================
-- PUZZLE ATTEMPTS (Game history)
-- ============================================================

CREATE TABLE IF NOT EXISTS puzzle_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  time_seconds INTEGER NOT NULL DEFAULT 0,
  hints_used INTEGER NOT NULL DEFAULT 0,
  words_found INTEGER NOT NULL DEFAULT 0,
  total_words INTEGER NOT NULL DEFAULT 0,
  accuracy REAL NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  combo_max INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  mode TEXT CHECK (mode IN ('daily', 'random', 'practice', 'challenge')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempts_user ON puzzle_attempts(user_id);
CREATE INDEX idx_attempts_puzzle ON puzzle_attempts(puzzle_id);
CREATE INDEX idx_attempts_completed ON puzzle_attempts(user_id, completed);
CREATE INDEX idx_attempts_created ON puzzle_attempts(user_id, created_at DESC);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('milestone', 'subject', 'streak', 'perfection', 'speed', 'social')),
  xp_reward INTEGER NOT NULL DEFAULT 0,
  coins_reward INTEGER NOT NULL DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed achievements
INSERT INTO achievements (id, name, description, icon, category, xp_reward, coins_reward, requirement_type, requirement_value) VALUES
  ('first_puzzle', 'Pertama Kali', 'Selesaikan teka-teki pertamamu!', '🎯', 'milestone', 50, 25, 'puzzles_completed', 1),
  ('puzzles_10', 'Rajin Belajar', 'Selesaikan 10 teka-teki', '📚', 'milestone', 100, 50, 'puzzles_completed', 10),
  ('puzzles_50', 'Pecandu TTS', 'Selesaikan 50 teka-teki', '💪', 'milestone', 250, 125, 'puzzles_completed', 50),
  ('puzzles_100', 'Master TTS', 'Selesaikan 100 teka-teki', '👑', 'milestone', 500, 250, 'puzzles_completed', 100),
  ('words_100', 'Seratus Kata', 'Temukan 100 kata!', '💯', 'milestone', 200, 100, 'words_found', 100),
  ('words_500', 'Lima Ratus Kata', 'Temukan 500 kata!', '🌟', 'milestone', 500, 250, 'words_found', 500),
  ('words_1000', 'Pencari Kata Sejati', 'Temukan 1000 kata!', '🏆', 'milestone', 1000, 500, 'words_found', 1000),
  ('islam_expert', 'Ahli Agama', 'Selesaikan 10 TTS Agama Islam', '🕌', 'subject', 150, 75, 'subject_mastery', 10),
  ('quran_lover', 'Pencinta Al-Quran', 'Selesaikan 10 TTS Al-Quran', '📖', 'subject', 150, 75, 'subject_mastery', 10),
  ('hadith_follower', 'Pengamal Hadits', 'Selesaikan 10 TTS Hadits', '📜', 'subject', 150, 75, 'subject_mastery', 10),
  ('arabic_master', 'Master Bahasa Arab', 'Selesaikan 10 TTS Bahasa Arab', '🖋️', 'subject', 150, 75, 'subject_mastery', 10),
  ('english_hero', 'English Hero', 'Selesaikan 10 TTS Bahasa Inggris', '🔤', 'subject', 150, 75, 'subject_mastery', 10),
  ('general_knowledge', 'Serba Tahu', 'Selesaikan 10 TTS Pengetahuan Umum', '🌟', 'subject', 150, 75, 'subject_mastery', 10),
  ('perfect_score', 'Sempurna!', 'Dapatkan skor sempurna dalam satu TTS', '⭐', 'perfection', 300, 150, 'perfect_score', 1),
  ('no_hints', 'Tanpa Petunjuk!', 'Selesaikan TTS tanpa petunjuk', '🧠', 'perfection', 200, 100, 'perfect_score', 1),
  ('streak_7', '7 Hari Berturut-turut', 'Main 7 hari berturut-turut', '🔥', 'streak', 200, 100, 'streak_days', 7),
  ('streak_30', '30 Hari Berturut-turut', 'Main 30 hari berturut-turut', '💪', 'streak', 500, 250, 'streak_days', 30),
  ('streak_365', 'Setahun Penuh', 'Main 365 hari berturut-turut', '👑', 'streak', 2000, 1000, 'streak_days', 365),
  ('speed_demon', 'Cepat Cermat', 'Selesaikan TTS kurang dari 2 menit', '⚡', 'speed', 200, 100, 'speed_clear', 120),
  ('super_speed', 'Super Cepat!', 'Selesaikan TTS kurang dari 1 menit', '🚀', 'speed', 500, 250, 'speed_clear', 60),
  ('level_5', 'Level 5', 'Capai level 5', '⭐', 'milestone', 100, 50, 'level_reached', 5),
  ('level_10', 'Level 10', 'Capai level 10', '🌟', 'milestone', 250, 125, 'level_reached', 10),
  ('level_25', 'Level 25', 'Capai level 25', '👑', 'milestone', 500, 250, 'level_reached', 25),
  ('level_50', 'Level 50', 'Capai level 50', '💎', 'milestone', 1000, 500, 'level_reached', 50),
  ('xp_5000', 'Pengumpul XP', 'Kumpulkan 5000 XP', '💰', 'milestone', 200, 100, 'xp_earned', 5000),
  ('xp_25000', 'Jutawan XP', 'Kumpulkan 25000 XP', '💎', 'milestone', 500, 250, 'xp_earned', 25000)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- USER ACHIEVEMENTS (Junction table)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- ============================================================
-- CLASSROOMS (Teacher feature)
-- ============================================================

CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX idx_classrooms_code ON classrooms(code);

-- ============================================================
-- CLASSROOM MEMBERS (Students in classrooms)
-- ============================================================

CREATE TABLE IF NOT EXISTS classroom_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(classroom_id, student_id)
);

CREATE INDEX idx_classroom_members_classroom ON classroom_members(classroom_id);
CREATE INDEX idx_classroom_members_student ON classroom_members(student_id);

-- ============================================================
-- ASSIGNMENTS (Teacher assigns puzzles to classrooms)
-- ============================================================

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  puzzle_id UUID REFERENCES puzzles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('islam', 'quran', 'hadith', 'arabic', 'english', 'general')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 6),
  due_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_classroom ON assignments(classroom_id);
CREATE INDEX idx_assignments_active ON assignments(is_active) WHERE is_active = true;

-- ============================================================
-- ASSIGNMENT SUBMISSIONS (Student completes an assignment)
-- ============================================================

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES puzzle_attempts(id) ON DELETE SET NULL,
  score INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON assignment_submissions(student_id);

-- ============================================================
-- PARENT-CHILD RELATIONSHIPS
-- ============================================================

CREATE TABLE IF NOT EXISTS parent_children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX idx_parent_children_child ON parent_children(child_id);

-- ============================================================
-- DAILY STREAK TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_logins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, login_date)
);

CREATE INDEX idx_daily_logins_user ON daily_logins(user_id);
CREATE INDEX idx_daily_logins_date ON daily_logins(login_date DESC);

-- ============================================================
-- AI USAGE LOGGING (For admin monitoring)
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL,
  subject TEXT,
  grade INTEGER,
  difficulty TEXT,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_date ON ai_usage_log(created_at DESC);
CREATE INDEX idx_ai_usage_user ON ai_usage_log(user_id);

-- ============================================================
-- LEADERBOARD VIEW
-- ============================================================

CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.id AS user_id,
  p.display_name,
  p.avatar_url,
  p.xp AS score,
  p.level,
  ROW_NUMBER() OVER (ORDER BY p.xp DESC) AS rank
FROM profiles p
WHERE p.role = 'student'
ORDER BY p.xp DESC;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Profiles: users can read all profiles, update only their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Puzzles: public read for approved, insert for authenticated
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Puzzles are viewable by everyone"
  ON puzzles FOR SELECT
  USING (approved = true OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can insert puzzles"
  ON puzzles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creator can update own puzzle"
  ON puzzles FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Admin can manage all puzzles"
  ON puzzles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Puzzle attempts: users see only their own
ALTER TABLE puzzle_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own attempts"
  ON puzzle_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers see students in their classrooms"
  ON puzzle_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classroom_members cm
      JOIN classrooms c ON cm.classroom_id = c.id
      WHERE cm.student_id = puzzle_attempts.user_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Parents see their children's attempts"
  ON puzzle_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_children
      WHERE child_id = puzzle_attempts.user_id
      AND parent_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own attempts"
  ON puzzle_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Classrooms: teacher manages own, students see their classrooms
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own classrooms"
  ON classrooms FOR ALL
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students see their classrooms"
  ON classrooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classroom_members
      WHERE classroom_id = classrooms.id
      AND student_id = auth.uid()
    )
  );

-- Classroom members: teachers manage, students view
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage classroom members"
  ON classroom_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE id = classroom_members.classroom_id
      AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students view own memberships"
  ON classroom_members FOR SELECT
  USING (student_id = auth.uid());

-- Parent-children: parents manage, children view
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents manage relationships"
  ON parent_children FOR ALL
  USING (parent_id = auth.uid());

CREATE POLICY "Children can view"
  ON parent_children FOR SELECT
  USING (child_id = auth.uid());

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Update profile streak
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  today DATE := CURRENT_DATE;
BEGIN
  SELECT last_active_date INTO last_date FROM profiles WHERE id = NEW.user_id;

  IF last_date IS NULL OR last_date < today - INTERVAL '1 day' THEN
    -- Reset streak (missed a day)
    UPDATE profiles
    SET streak_days = 1,
        last_active_date = today
    WHERE id = NEW.user_id;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE profiles
    SET streak_days = streak_days + 1,
        last_active_date = today
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_puzzle_attempt_completed
  AFTER INSERT ON puzzle_attempts
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION update_streak();

-- Update puzzle play count
CREATE OR REPLACE FUNCTION increment_puzzle_play_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE puzzles
  SET play_count = play_count + 1
  WHERE id = NEW.puzzle_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_puzzle_attempt_insert
  AFTER INSERT ON puzzle_attempts
  FOR EACH ROW
  EXECUTE FUNCTION increment_puzzle_play_count();

-- ============================================================
-- SCHEDULED FUNCTION: Create daily puzzle if not exists
-- ============================================================

CREATE OR REPLACE FUNCTION generate_daily_puzzle()
RETURNS void AS $$
DECLARE
  today DATE := CURRENT_DATE;
  existing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM puzzles
  WHERE is_daily = true
    AND created_at::DATE = today;

  -- If no daily puzzle exists for today, the API route will create one
  -- This function logs the status
  IF existing_count = 0 THEN
    RAISE NOTICE 'No daily puzzle for today (%). API will generate on first request.', today;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- UPDATED_AT TRIGGER function
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_puzzles_updated_at
  BEFORE UPDATE ON puzzles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classrooms_updated_at
  BEFORE UPDATE ON classrooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA: Sample users for development
-- ============================================================

-- Note: Users are created through Supabase Auth UI or signup API.
-- The trigger handle_new_user() auto-creates profiles.
-- Below are additional seed data for existing users.

-- Sample daily puzzle for first-time users
INSERT INTO puzzles (title, theme, difficulty, subject, grade, grid_data, words, is_daily, approved, source_metadata)
VALUES (
  'Rukun Islam',
  '5 Rukun Islam',
  'easy',
  'islam',
  1,
  '{
    "rows": 1,
    "cols": 8,
    "cells": [
      [
        {"letter": "S", "isBlocked": false, "wordIds": ["w1"]},
        {"letter": "Y", "isBlocked": false, "wordIds": ["w1"]},
        {"letter": "A", "isBlocked": false, "wordIds": ["w1"]},
        {"letter": "H", "isBlocked": false, "wordIds": ["w1"]},
        {"letter": "A", "isBlocked": false, "wordIds": ["w1"]},
        {"letter": "D", "isBlocked": false, "wordIds": ["w1"]},
        {"letter": "A", "isBlocked": false, "wordIds": ["w1"]},
        {"letter": "T", "isBlocked": false, "wordIds": ["w1"]}
      ]
    ]
  }'::jsonb,
  '[
    {
      "id": "w1",
      "answer": "SYAHADAT",
      "clue": "Dua kalimat yang menjadi rukun Islam pertama",
      "explanation": "Syahadat adalah kalimat kesaksian bahwa tiada Tuhan selain Allah dan Muhammad adalah utusan Allah",
      "direction": "horizontal",
      "startRow": 0,
      "startCol": 0
    }
  ]'::jsonb,
  true,
  true,
  '[{"word": "SYAHADAT", "type": "fiqh", "reference": "Hadits Riwayat Muslim"}]'::jsonb
) ON CONFLICT DO NOTHING;
