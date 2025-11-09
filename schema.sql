-- Create the profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  role text NOT NULL DEFAULT 'user',
  age int,
  height int,
  weight numeric,
  calorie_target int,
  protein_goal int,
  carb_goal int,
  fat_goal int,
  PRIMARY KEY (id)
);

-- Create the meals table
CREATE TABLE public.meals (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  "time" time,
  servings int,
  image_url text,
  preferences jsonb,
  nutrition jsonb,
  ingredients text[],
  created_at timestamptz DEFAULT now()
);

-- Create the meal_plans table
CREATE TABLE public.meal_plans (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create the meal_plan_items table
CREATE TABLE public.meal_plan_items (
  id bigserial PRIMARY KEY,
  meal_plan_id bigint NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  meal_id bigint NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  day_of_week int -- 1 for Monday, 7 for Sunday
);

-- Create the daily_progress table
CREATE TABLE public.daily_progress (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "date" date NOT NULL,
  calories_consumed int,
  protein_consumed int,
  carbs_consumed int,
fats_consumed int,
  water_intake int,
  UNIQUE (user_id, "date") -- Ensures one entry per user per day
);

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles table
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile." ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS policies for meals table
CREATE POLICY "Users can view their own meals." ON public.meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own meals." ON public.meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meals." ON public.meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meals." ON public.meals FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for meal_plans table
CREATE POLICY "Users can view their own meal_plans." ON public.meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own meal_plans." ON public.meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meal_plans." ON public.meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meal_plans." ON public.meal_plans FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for meal_plan_items table
CREATE POLICY "Users can view their own meal_plan_items." ON public.meal_plan_items FOR SELECT USING (auth.uid() = (SELECT user_id FROM meal_plans WHERE id = meal_plan_id));
CREATE POLICY "Users can create their own meal_plan_items." ON public.meal_plan_items FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM meal_plans WHERE id = meal_plan_id));
CREATE POLICY "Users can update their own meal_plan_items." ON public.meal_plan_items FOR UPDATE USING (auth.uid() = (SELECT user_id FROM meal_plans WHERE id = meal_plan_id));
CREATE POLICY "Users can delete their own meal_plan_items." ON public.meal_plan_items FOR DELETE USING (auth.uid() = (SELECT user_id FROM meal_plans WHERE id = meal_plan_id));

-- RLS policies for daily_progress table
CREATE POLICY "Users can view their own daily progress." ON public.daily_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own daily progress." ON public.daily_progress FOR ALL USING (auth.uid() = user_id);
