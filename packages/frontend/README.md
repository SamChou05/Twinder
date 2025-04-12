# Twinder Frontend

A dating app for duos - find your perfect match for team activities and games.

## Setting Up Supabase Authentication

1. **Create a Supabase Project**:
   - Go to [Supabase](https://supabase.com/) and sign up or log in
   - Create a new project
   - Note your project URL and anon/public key

2. **Configure Email Authentication**:
   - In your Supabase project, navigate to Authentication → Providers
   - Enable Email provider
   - Configure if you want to require email verification (recommended)

3. **Set Up Environment Variables**:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase URL and anon key:
     ```
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

4. **Create User Profiles Table**:
   - In Supabase SQL Editor, create a profiles table that extends the auth.users table:
   ```sql
   create table profiles (
     id uuid references auth.users on delete cascade not null primary key,
     name text,
     age int,
     bio text,
     photos text[],
     created_at timestamp with time zone default now() not null,
     updated_at timestamp with time zone default now() not null
   );

   -- Set up Row Level Security
   alter table profiles enable row level security;

   -- Create policy to allow users to manage their own profile
   create policy "Users can manage their own profile" 
   on profiles for all 
   using (auth.uid() = id);

   -- Create function to create a profile after signup
   create or replace function public.handle_new_user()
   returns trigger as $$
   begin
     insert into public.profiles (id, name, age)
     values (new.id, new.raw_user_meta_data->>'name', (new.raw_user_meta_data->>'age')::int);
     return new;
   end;
   $$ language plpgsql security definer;

   -- Create trigger to create profile after signup
   create trigger on_auth_user_created
     after insert on auth.users
     for each row execute procedure public.handle_new_user();
   ```

## Running the App

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ``` 