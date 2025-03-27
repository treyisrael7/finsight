-- Add NOT NULL constraints
ALTER TABLE your_table
ALTER COLUMN lesson_id SET NOT NULL,
ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint to prevent duplicate progress records
ALTER TABLE your_table
ADD CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_id);

-- Add indexes for better query performance
CREATE INDEX idx_lesson_id ON your_table(lesson_id);
CREATE INDEX idx_user_id ON your_table(user_id);

-- Add foreign key constraints with appropriate cascade rules
ALTER TABLE your_table
ADD CONSTRAINT fk_lesson
FOREIGN KEY (lesson_id)
REFERENCES public.lessons(id)
ON DELETE RESTRICT;

ALTER TABLE your_table
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE; 