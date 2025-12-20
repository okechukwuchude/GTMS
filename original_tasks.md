# GTMS MVP Development Plan

**Last Updated**: December 15, 2025
**Estimated Total Tasks**: 50+
**Target MVP Features**: Public user cargo registration (manual + OCR), container tracking, basic internal staff inspection workflow

---

## Phase 1: Setup Phase (Tasks 1-8)

### Task 1: Initialize Next.js Project with TypeScript

**Objective**: Create new Next.js 14 project with TypeScript and configure essential tooling

**Files to create**:

- Project root structure
- `package.json`
- `tsconfig.json`
- `next.config.js`
- `.gitignore`
- `.env.local.example`

**Commands**:

```bash
npx create-next-app@14 . --typescript --tailwind --app --use-pnpm
```

**Acceptance Criteria**:

- [ ] `pnpm dev` starts development server on port 3000
- [ ] TypeScript strict mode enabled in `tsconfig.json`
- [ ] Tailwind CSS configured and working
- [ ] Can view default Next.js page at `http://localhost:3000`

**Dependencies**: None

**Rollback**: Delete all generated files, start fresh

---

### Task 2: Install Core Dependencies

**Objective**: Install all required packages for MVP features

**Files to modify**:

- `package.json`

**Commands**:

```bash
pnpm add @supabase/ssr @supabase/supabase-js @tanstack/react-query @tanstack/react-table
pnpm add react-hook-form @hookform/resolvers zod date-fns
pnpm add zustand clsx tailwind-merge class-variance-authority
pnpm add lucide-react sonner
pnpm add -D @types/node prettier eslint-config-prettier
```

**Acceptance Criteria**:

- [ ] All packages install without errors
- [ ] `pnpm install` completes successfully
- [ ] No peer dependency warnings for critical packages
- [ ] TypeScript recognizes all installed types

**Dependencies**: Task 1

**Rollback**:

```bash
git checkout package.json pnpm-lock.yaml
rm -rf node_modules
pnpm install
```

---

### Task 3: Configure shadcn/ui

**Objective**: Set up shadcn/ui component library with required primitives

**Files to create/modify**:

- `components.json`
- `lib/utils.ts`

**Commands**:

```bash
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button input label form card select dialog table badge tabs toast dropdown-menu separator
```

**Acceptance Criteria**:

- [ ] `components.json` exists with correct configuration
- [ ] `lib/utils.ts` contains `cn()` utility function
- [ ] All shadcn components exist in `components/ui/`
- [ ] Can import and use Button component in a test page

**Dependencies**: Task 2

**Rollback**:

```bash
rm -rf components/ui lib/utils.ts components.json
```

---

### Task 4: Set Up Environment Variables Structure

**Objective**: Create environment configuration files with all required variables

**Files to create**:

- `.env.local.example`
- `.env.local` (gitignored)

**Content for `.env.local.example`**:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Maritime Container Inspection"

# Supabase (to be filled in Task 10)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OCR Service (for later phases)
# GOOGLE_CLOUD_PROJECT_ID=
# GOOGLE_CLOUD_CREDENTIALS=

# Feature Flags
NEXT_PUBLIC_ENABLE_OCR=false
NEXT_PUBLIC_ENABLE_REALTIME=false
```

**Acceptance Criteria**:

- [ ] `.env.local.example` committed to git
- [ ] `.env.local` added to `.gitignore`
- [ ] Copy `.env.local.example` to `.env.local` works
- [ ] No sensitive values in `.env.local.example`

**Dependencies**: Task 1

**Rollback**: Delete created files

---

### Task 5: Configure ESLint and Prettier

**Objective**: Set up code formatting and linting standards

**Files to create/modify**:

- `.eslintrc.json`
- `.prettierrc`
- `.prettierignore`

**Content for `.prettierrc`**:

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Acceptance Criteria**:

- [ ] `pnpm lint` runs without errors
- [ ] `pnpm format` (add to package.json) formats files correctly
- [ ] VSCode/editor respects formatting rules
- [ ] Tailwind classes auto-sorted by Prettier

**Dependencies**: Task 2

**Rollback**: Remove config files, use Next.js defaults

---

### Task 6: Create Base Folder Structure

**Objective**: Set up the complete folder structure as per architecture

**Directories to create**:

```
src/
├── app/
│   ├── (auth)/
│   ├── (public)/
│   ├── (staff)/
│   └── api/
├── components/
│   ├── auth/
│   ├── containers/
│   ├── vessels/
│   ├── inspections/
│   ├── documents/
│   ├── layout/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── api/
│   ├── hooks/
│   ├── stores/
│   ├── constants/
│   ├── validations/
│   └── utils/
└── types/
```

**Commands**:

```bash
mkdir -p src/app/{auth,public,staff,api}
mkdir -p src/components/{auth,containers,vessels,inspections,documents,layout,shared}
mkdir -p src/lib/{supabase,api,hooks,stores,constants,validations,utils}
mkdir -p src/types
```

**Acceptance Criteria**:

- [ ] All directories exist
- [ ] Can create files in any directory
- [ ] Folder structure matches architecture.md
- [ ] IDE recognizes paths for autocomplete

**Dependencies**: Task 1

**Rollback**: Delete src/ directory, restore default app/ structure

---

### Task 7: Configure TypeScript Path Aliases

**Objective**: Set up convenient import paths

**Files to modify**:

- `tsconfig.json`

**Add to `compilerOptions`**:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

**Acceptance Criteria**:

- [ ] Can import using `@/components/ui/button`
- [ ] TypeScript doesn't show errors for path imports
- [ ] IDE autocomplete works with aliases
- [ ] Test import in any file compiles successfully

**Dependencies**: Task 6

**Rollback**: Remove `paths` from `tsconfig.json`

---

### Task 8: Set Up Git Repository and Initial Commit

**Objective**: Initialize version control with proper .gitignore

**Files to create/modify**:

- `.gitignore`
- Initialize git repository

**Commands**:

```bash
git init
git add .
git commit -m "Initial project setup with Next.js 14, TypeScript, and Tailwind"
```

**Acceptance Criteria**:

- [ ] Git repository initialized
- [ ] `.env.local` not tracked by git
- [ ] `node_modules/` not tracked
- [ ] `.next/` build directory not tracked
- [ ] First commit created successfully

**Dependencies**: Tasks 1-7

**Rollback**:

```bash
rm -rf .git
```

---

## Phase 2: Database Phase (Tasks 9-16)

### Task 9: Create Supabase Project

**Objective**: Set up Supabase project and obtain credentials

**Manual Steps**:

1. Go to https://supabase.com
2. Create new project: "gtms-production"
3. Save database password securely
4. Wait for project provisioning (~2 minutes)
5. Navigate to Settings > API
6. Copy Project URL and anon/service keys

**Acceptance Criteria**:

- [ ] Supabase project created and active
- [ ] Can access Supabase dashboard
- [ ] Have Project URL
- [ ] Have anon (public) key
- [ ] Have service_role (secret) key

**Dependencies**: Task 4 (need .env structure)

**Rollback**: Delete Supabase project from dashboard

---

### Task 10: Configure Supabase Environment Variables

**Objective**: Add Supabase credentials to local environment

**Files to modify**:

- `.env.local`

**Add**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

**Acceptance Criteria**:

- [ ] All three variables populated
- [ ] Variables not committed to git
- [ ] Can read `process.env.NEXT_PUBLIC_SUPABASE_URL` in code
- [ ] URLs and keys are valid format

**Dependencies**: Task 9

**Rollback**: Clear values from `.env.local`

---

### Task 11: Create Supabase Client Utilities

**Objective**: Set up Supabase clients for browser, server, and middleware

**Files to create**:

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`

**Content for `client.ts`**:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Content for `server.ts`**:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**Content for `middleware.ts`**: (Basic structure, will expand in auth phase)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  await supabase.auth.getUser()
  return response
}
```

**Acceptance Criteria**:

- [ ] All three files created
- [ ] No TypeScript errors
- [ ] Can import clients in other files
- [ ] Environment variables properly referenced

**Dependencies**: Task 10

**Rollback**: Delete the three created files

---

### Task 12: Create Initial Database Migration - Profiles Table

**Objective**: Create profiles table extending Supabase auth.users

**SQL Script Location**:

- Open `database_scripts.sql` in project root
- Copy **MIGRATION 1: PROFILES TABLE** section
- Execute in Supabase dashboard SQL Editor

**Steps**:

1. Open Supabase project dashboard
2. Navigate to SQL Editor
3. Copy Migration 1 from `database_scripts.sql` (lines 18-109)
4. Paste and execute in SQL Editor
5. Verify success in Table Editor

**Acceptance Criteria**:

- [ ] SQL executes without errors in Supabase SQL Editor
- [ ] Table `profiles` appears in Table Editor
- [ ] Can insert a test profile record
- [ ] RLS policies active (check in Supabase dashboard)
- [ ] Trigger creates profile when auth.users record created
- [ ] All indexes created (check `idx_profiles_user_type`, `idx_profiles_email`, `idx_profiles_company_name`)

**Dependencies**: Task 10

**Rollback**:

- See "ROLLBACK MIGRATION 1" section in `database_scripts.sql` (lines 111-119)

---

### Task 13: Create Ports Table Migration

**Objective**: Create ports reference table

**SQL Script Location**:

- Open `database_scripts.sql` in project root
- Copy **MIGRATION 2: PORTS TABLE** section
- Execute in Supabase dashboard SQL Editor

**Steps**:

1. Open Supabase SQL Editor
2. Copy Migration 2 from `database_scripts.sql` (lines 121-167)
3. Paste and execute in SQL Editor
4. Verify ports table and sample data in Table Editor

**Acceptance Criteria**:

- [ ] Table `ports` created successfully
- [ ] 3 sample ports inserted (Lagos, Port Harcourt, Apapa)
- [ ] Can query ports table
- [ ] Unique constraint on `code` works (try inserting duplicate code)
- [ ] Status check constraint works (try invalid status)
- [ ] All indexes created (check `idx_ports_code`, `idx_ports_country`, `idx_ports_status`)

**Dependencies**: Task 12

**Rollback**:

- See "ROLLBACK MIGRATION 2" section in `database_scripts.sql` (lines 169-173)

---

### Task 14: Create Containers Table Migration

**Objective**: Create core containers table for cargo tracking

**SQL Script Location**:

- Open `database_scripts.sql` in project root
- Copy **MIGRATION 3: CONTAINERS TABLE** section
- Execute in Supabase dashboard SQL Editor

**Steps**:

1. Open Supabase SQL Editor
2. Copy Migration 3 from `database_scripts.sql` (lines 175-256)
3. Paste and execute in SQL Editor
4. Verify containers table in Table Editor

**Acceptance Criteria**:

- [ ] Table `containers` created successfully
- [ ] All constraints work (status check, container_type check)
- [ ] Foreign keys to profiles and ports work
- [ ] RLS policies prevent cross-user access (test by creating containers with different users)
- [ ] Can insert test container record
- [ ] All 7 indexes created (verify in Supabase)
- [ ] `updated_at` trigger works

**Dependencies**: Tasks 12, 13

**Rollback**:

- See "ROLLBACK MIGRATION 3" section in `database_scripts.sql` (lines 258-262)

---

### Task 15: Create Container Status History Table

**Objective**: Track all container status changes with automatic logging

**SQL Script Location**:

- Open `database_scripts.sql` in project root
- Copy **MIGRATION 4: CONTAINER STATUS HISTORY TABLE** section
- Execute in Supabase dashboard SQL Editor

**Steps**:

1. Open Supabase SQL Editor
2. Copy Migration 4 from `database_scripts.sql` (lines 264-332)
3. Paste and execute in SQL Editor
4. Verify container_status_history table and trigger in Table Editor

**Testing Steps**:

1. Create a test container in containers table
2. Update its status: `UPDATE containers SET status = 'in_transit' WHERE id = [test-id]`
3. Verify history record auto-created in container_status_history table
4. Check that timestamp and status match

**Acceptance Criteria**:

- [ ] Table `container_status_history` created successfully
- [ ] Trigger `track_container_status` exists on containers table
- [ ] Test: Update container status, verify history record created automatically
- [ ] RLS policy prevents viewing other users' history
- [ ] Both indexes created (`idx_status_history_container`, `idx_status_history_changed_at`)
- [ ] Cascade delete works (delete container, verify history deleted)

**Dependencies**: Task 14

**Rollback**:

- See "ROLLBACK MIGRATION 4" section in `database_scripts.sql` (lines 334-340)

---

### Task 16: Generate TypeScript Types from Supabase

**Objective**: Generate type-safe TypeScript definitions from database schema

**Commands**:

```bash
# Install Supabase CLI if not installed
pnpm add -D supabase

# Login to Supabase
pnpm supabase login

# Link to your project
pnpm supabase link --project-ref [your-project-ref]

# Generate types
pnpm supabase gen types typescript --linked > src/types/database.ts
```

**Add to package.json scripts**:

```json
{
  "scripts": {
    "supabase:gen-types": "supabase gen types typescript --linked > src/types/database.ts"
  }
}
```

**Acceptance Criteria**:

- [ ] `src/types/database.ts` generated
- [ ] File contains types for all tables (profiles, ports, containers, container_status_history)
- [ ] No TypeScript errors in generated file
- [ ] Can import types: `import { Database } from '@/types/database'`

**Dependencies**: Tasks 12-15

**Rollback**: Delete `src/types/database.ts`

---

## Phase 3: Authentication Phase (Tasks 17-25)

### Task 17: Create Type Definitions for Auth

**Objective**: Create TypeScript types for user profiles and auth

**Files to create**:

- `src/types/auth.ts`

**Content**:

```typescript
import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type UserType = 'public' | 'staff'

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}

export interface RegisterFormData {
  email: string
  password: string
  full_name: string
  user_type: UserType
  company_name?: string
  company_registration?: string
  phone?: string
}

export interface LoginFormData {
  email: string
  password: string
}
```

**Acceptance Criteria**:

- [ ] File created with no TypeScript errors
- [ ] Types properly reference Database types
- [ ] Can import types in other files

**Dependencies**: Task 16

**Rollback**: Delete file

---

### Task 18: Create Zod Validation Schemas for Auth

**Objective**: Create validation schemas for registration and login

**Files to create**:

- `src/lib/validations/auth.ts`

**Content**:

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  user_type: z.enum(['public', 'staff']),
  company_name: z.string().optional(),
  company_registration: z.string().optional(),
  phone: z.string().optional(),
})

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  company_registration: z.string().optional(),
  address: z.string().optional(),
  country_code: z.string().length(3).optional(),
  preferred_language: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
```

**Acceptance Criteria**:

- [ ] All schemas created
- [ ] Password validation includes all requirements
- [ ] Can validate test data successfully
- [ ] Types inferred correctly

**Dependencies**: Task 17

**Rollback**: Delete file

---

### Task 19: Create Auth API Route - Register

**Objective**: Create API endpoint for user registration

**Files to create**:

- `src/app/api/auth/register/route.ts`

**Content**:

```typescript
import { createClient } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validations/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.full_name,
          user_type: validatedData.user_type,
          company_name: validatedData.company_name,
          company_registration: validatedData.company_registration,
          phone: validatedData.phone,
        },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        data: {
          user: authData.user,
          message: 'Registration successful. Please check your email to verify your account.',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Acceptance Criteria**:

- [ ] API route created
- [ ] Can POST to `/api/auth/register`
- [ ] Validation errors return 400
- [ ] Successful registration returns 201
- [ ] User and profile created in database
- [ ] Verification email sent (check Supabase email logs)

**Dependencies**: Tasks 11, 18

**Rollback**: Delete route file

---

### Task 20: Create Auth API Route - Login

**Objective**: Create API endpoint for user login

**Files to create**:

- `src/app/api/auth/login/route.ts`

**Content**:

```typescript
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 })
    }

    // Update last login time
    await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id)

    return NextResponse.json({
      data: {
        user: authData.user,
        session: authData.session,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Acceptance Criteria**:

- [ ] API route created
- [ ] Can POST to `/api/auth/login`
- [ ] Invalid credentials return 401
- [ ] Valid credentials return session
- [ ] `last_login_at` updated in profiles table

**Dependencies**: Tasks 11, 18

**Rollback**: Delete route file

---

### Task 21: Create Auth API Route - Logout

**Objective**: Create API endpoint for user logout

**Files to create**:

- `src/app/api/auth/logout/route.ts`

**Content**:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Acceptance Criteria**:

- [ ] API route created
- [ ] Can POST to `/api/auth/logout`
- [ ] Session cleared after logout
- [ ] Returns success response

**Dependencies**: Task 11

**Rollback**: Delete route file

---

### Task 22: Create useAuth Hook

**Objective**: Create React hook for auth state management

**Files to create**:

- `src/lib/hooks/use-auth.ts`

**Content**:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)

      if (session?.user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData)
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setProfile(null)
  }

  return {
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user,
    isPublicUser: profile?.user_type === 'public',
    isStaff: profile?.user_type === 'staff',
  }
}
```

**Acceptance Criteria**:

- [ ] Hook created with no TypeScript errors
- [ ] Can use in components: `const { user, profile, loading } = useAuth()`
- [ ] Loading state works correctly
- [ ] Auth state updates on login/logout
- [ ] Profile fetched automatically

**Dependencies**: Tasks 11, 17

**Rollback**: Delete file

---

### Task 23: Create Login Page Component

**Objective**: Create login form UI

**Files to create**:

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/layout.tsx`
- `src/components/auth/login-form.tsx`

**Content for `layout.tsx`**:

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Maritime Container Inspection
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
```

**Content for `login-form.tsx`**:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Login failed')
        return
      }

      toast.success('Login successful')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
          Register here
        </a>
      </p>
    </form>
  )
}
```

**Content for `page.tsx`**:

```typescript
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return <LoginForm />
}
```

**Acceptance Criteria**:

- [ ] Can navigate to `/login`
- [ ] Form displays correctly
- [ ] Validation errors show for invalid input
- [ ] Can submit form with valid credentials
- [ ] Redirects to `/dashboard` on success
- [ ] Toast notifications work

**Dependencies**: Tasks 3, 18, 20, 22

**Rollback**: Delete created files

---

### Task 24: Create Registration Page Component

**Objective**: Create registration form UI

**Files to create**:

- `src/app/(auth)/register/page.tsx`
- `src/components/auth/register-form.tsx`

**Content for `register-form.tsx`**:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      user_type: 'public',
    },
  })

  const userType = watch('user_type')

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Registration failed')
        return
      }

      toast.success(result.data.message)
      router.push('/login')
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="user_type">Account Type</Label>
        <Select
          value={userType}
          onValueChange={(value) => setValue('user_type', value as 'public' | 'staff')}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public User (Importer/Exporter)</SelectItem>
            <SelectItem value="staff" disabled>
              Staff (By invitation only)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" {...register('full_name')} disabled={isLoading} />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} disabled={isLoading} />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password')} disabled={isLoading} />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Must include uppercase, lowercase, number, and special character
        </p>
      </div>

      <div>
        <Label htmlFor="company_name">Company Name (Optional)</Label>
        <Input id="company_name" {...register('company_name')} disabled={isLoading} />
      </div>

      <div>
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input id="phone" {...register('phone')} disabled={isLoading} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in here
        </a>
      </p>
    </form>
  )
}
```

**Content for `page.tsx`**:

```typescript
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return <RegisterForm />
}
```

**Acceptance Criteria**:

- [ ] Can navigate to `/register`
- [ ] Form displays correctly
- [ ] Validation shows for invalid passwords
- [ ] Can submit form with valid data
- [ ] User and profile created in database
- [ ] Redirects to login with success message
- [ ] Email verification sent

**Dependencies**: Tasks 3, 18, 19, 23

**Rollback**: Delete created files

---

### Task 25: Create Protected Route Middleware

**Objective**: Implement route protection based on user type

**Files to modify**:

- `src/middleware.ts` (create if doesn't exist)

**Content**:

```typescript
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Update session
  const response = await updateSession(request)

  // Get the pathname
  const path = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(path)

  // If on a public route, allow access
  if (isPublicRoute) {
    return response
  }

  // Check if user is authenticated
  const sessionCookie = request.cookies.get('sb-access-token')

  if (!sessionCookie) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

**Acceptance Criteria**:

- [ ] Unauthenticated users redirected to `/login` when accessing protected routes
- [ ] Can access `/login` and `/register` without auth
- [ ] Authenticated users can access `/dashboard`
- [ ] Session cookie properly checked

**Dependencies**: Task 11

**Rollback**: Delete or comment out middleware.ts

---

## Phase 4: Core Features Phase (Tasks 26-42)

### Task 26: Create Container Type Definitions

**Objective**: Create TypeScript types for containers

**Files to create**:

- `src/types/container.ts`

**Content**:

```typescript
import { Database } from './database'

export type Container = Database['public']['Tables']['containers']['Row']
export type ContainerInsert = Database['public']['Tables']['containers']['Insert']
export type ContainerUpdate = Database['public']['Tables']['containers']['Update']

export type ContainerStatus =
  | 'registered'
  | 'in_transit'
  | 'arrived'
  | 'pending_inspection'
  | 'under_inspection'
  | 'inspection_complete'
  | 'cleared'
  | 'detained'
  | 'released'
  | 'departed'

export type ContainerType =
  | '20FT'
  | '40FT'
  | '40FT_HC'
  | '45FT'
  | 'REEFER'
  | 'TANK'
  | 'OPEN_TOP'
  | 'FLAT_RACK'

export interface ContainerFormData {
  container_number: string
  seal_number?: string
  bill_of_lading: string
  shipper_name: string
  shipper_address?: string
  shipper_country?: string
  consignee_name: string
  consignee_address?: string
  consignee_country?: string
  cargo_description: string
  hs_code?: string
  commodity_type?: string
  quantity?: number
  quantity_unit?: string
  weight_kg?: number
  volume_cbm?: number
  value_usd?: number
  origin_port_id?: string
  destination_port_id?: string
  container_type: ContainerType
  is_hazardous: boolean
  hazard_class?: string
  eta?: string
}
```

**Acceptance Criteria**:

- [ ] Types created with no errors
- [ ] Can import in other files
- [ ] Properly references database types

**Dependencies**: Task 16

**Rollback**: Delete file

---

### Task 27: Create Container Validation Schemas

**Objective**: Create Zod schemas for container operations

**Files to create**:

- `src/lib/validations/container.ts`

**Content**:

```typescript
import { z } from 'zod'

export const createContainerSchema = z.object({
  container_number: z
    .string()
    .min(1, 'Container number is required')
    .max(20, 'Container number too long')
    .regex(/^[A-Z]{4}[0-9]{7}$/, 'Invalid container number format (e.g., ABCD1234567)'),
  seal_number: z.string().max(50).optional(),
  bill_of_lading: z.string().min(1, 'Bill of lading is required').max(50),
  shipper_name: z.string().min(1, 'Shipper name is required').max(255),
  shipper_address: z.string().optional(),
  shipper_country: z.string().length(3).optional(),
  consignee_name: z.string().min(1, 'Consignee name is required').max(255),
  consignee_address: z.string().optional(),
  consignee_country: z.string().length(3).optional(),
  cargo_description: z.string().min(1, 'Cargo description is required'),
  hs_code: z.string().max(20).optional(),
  commodity_type: z.string().max(100).optional(),
  quantity: z.number().positive().optional(),
  quantity_unit: z.string().max(20).optional(),
  weight_kg: z.number().positive().optional(),
  volume_cbm: z.number().positive().optional(),
  value_usd: z.number().positive().optional(),
  origin_port_id: z.string().uuid().optional(),
  destination_port_id: z.string().uuid().optional(),
  container_type: z.enum([
    '20FT',
    '40FT',
    '40FT_HC',
    '45FT',
    'REEFER',
    'TANK',
    'OPEN_TOP',
    'FLAT_RACK',
  ]),
  is_hazardous: z.boolean().default(false),
  hazard_class: z.string().max(50).optional(),
  eta: z.string().datetime().optional(),
})

export type CreateContainerInput = z.infer<typeof createContainerSchema>
```

**Acceptance Criteria**:

- [ ] Schema validates container number format correctly
- [ ] Required fields enforced
- [ ] Optional fields work
- [ ] Types inferred correctly

**Dependencies**: Task 26

**Rollback**: Delete file

---

### Task 28: Create Container API Route - Create

**Objective**: Create API endpoint to create new containers

**Files to create**:

- `src/app/api/containers/route.ts`

**Content**:

```typescript
import { createClient } from '@/lib/supabase/server'
import { createContainerSchema } from '@/lib/validations/container'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createContainerSchema.parse(body)

    // Create container
    const { data, error } = await supabase
      .from('containers')
      .insert({
        ...validatedData,
        owner_id: session.user.id,
        created_by: session.user.id,
        status: 'registered',
        registration_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Container creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Container creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('containers')
      .select(
        '*, origin_port:ports!origin_port_id(name, code), destination_port:ports!destination_port_id(name, code)',
        { count: 'exact' }
      )
      .eq('owner_id', session.user.id)
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Container fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Container fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Acceptance Criteria**:

- [ ] POST to `/api/containers` creates container
- [ ] GET to `/api/containers` returns user's containers
- [ ] Pagination works correctly
- [ ] Status filter works
- [ ] RLS prevents seeing other users' containers
- [ ] Validation errors return proper messages

**Dependencies**: Tasks 11, 27

**Rollback**: Delete file

---

### Task 29: Create useContainers Hook

**Objective**: Create React Query hook for container operations

**Files to create**:

- `src/lib/hooks/use-containers.ts`

**Content**:

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Container } from '@/types/container'
import { CreateContainerInput } from '@/lib/validations/container'
import { toast } from 'sonner'

interface ContainersResponse {
  data: Container[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseContainersOptions {
  page?: number
  limit?: number
  status?: string
}

export function useContainers(options: UseContainersOptions = {}) {
  const { page = 1, limit = 20, status } = options

  return useQuery<ContainersResponse>({
    queryKey: ['containers', { page, limit, status }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (status) {
        params.append('status', status)
      }

      const res = await fetch(`/api/containers?${params}`)

      if (!res.ok) {
        throw new Error('Failed to fetch containers')
      }

      return res.json()
    },
  })
}

export function useCreateContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateContainerInput) => {
      const res = await fetch('/api/containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create container')
      }

      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
      toast.success('Container registered successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
```

**Acceptance Criteria**:

- [ ] Hook fetches containers correctly
- [ ] Pagination works
- [ ] Create mutation works
- [ ] Query invalidation after create
- [ ] Toast notifications show

**Dependencies**: Tasks 28

**Rollback**: Delete file

---

### Task 30: Create Container Registration Form Component

**Objective**: Create manual container registration form

**Files to create**:

- `src/components/containers/container-registration-form.tsx`

**Content**: (Due to length, showing key structure)

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createContainerSchema, CreateContainerInput } from '@/lib/validations/container'
import { useCreateContainer } from '@/lib/hooks/use-containers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

export function ContainerRegistrationForm() {
  const createContainer = useCreateContainer()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateContainerInput>({
    resolver: zodResolver(createContainerSchema),
    defaultValues: {
      container_type: '20FT',
      is_hazardous: false,
    },
  })

  const onSubmit = (data: CreateContainerInput) => {
    createContainer.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Container Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Container Information</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="container_number">Container Number *</Label>
            <Input
              id="container_number"
              placeholder="ABCD1234567"
              {...register('container_number')}
            />
            {errors.container_number && (
              <p className="mt-1 text-sm text-red-600">{errors.container_number.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bill_of_lading">Bill of Lading *</Label>
            <Input id="bill_of_lading" {...register('bill_of_lading')} />
            {errors.bill_of_lading && (
              <p className="mt-1 text-sm text-red-600">{errors.bill_of_lading.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="seal_number">Seal Number</Label>
            <Input id="seal_number" {...register('seal_number')} />
          </div>

          <div>
            <Label htmlFor="container_type">Container Type *</Label>
            <Select
              value={watch('container_type')}
              onValueChange={(value) => setValue('container_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20FT">20FT</SelectItem>
                <SelectItem value="40FT">40FT</SelectItem>
                <SelectItem value="40FT_HC">40FT High Cube</SelectItem>
                <SelectItem value="45FT">45FT</SelectItem>
                <SelectItem value="REEFER">Reefer</SelectItem>
                <SelectItem value="TANK">Tank</SelectItem>
                <SelectItem value="OPEN_TOP">Open Top</SelectItem>
                <SelectItem value="FLAT_RACK">Flat Rack</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Shipper Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Shipper Information</h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="shipper_name">Shipper Name *</Label>
            <Input id="shipper_name" {...register('shipper_name')} />
            {errors.shipper_name && (
              <p className="mt-1 text-sm text-red-600">{errors.shipper_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="shipper_address">Shipper Address</Label>
            <Textarea id="shipper_address" {...register('shipper_address')} />
          </div>

          <div>
            <Label htmlFor="shipper_country">Shipper Country Code</Label>
            <Input id="shipper_country" placeholder="USA" maxLength={3} {...register('shipper_country')} />
          </div>
        </div>
      </div>

      {/* Consignee Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Consignee Information</h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="consignee_name">Consignee Name *</Label>
            <Input id="consignee_name" {...register('consignee_name')} />
            {errors.consignee_name && (
              <p className="mt-1 text-sm text-red-600">{errors.consignee_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="consignee_address">Consignee Address</Label>
            <Textarea id="consignee_address" {...register('consignee_address')} />
          </div>
        </div>
      </div>

      {/* Cargo Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cargo Information</h3>

        <div>
          <Label htmlFor="cargo_description">Cargo Description *</Label>
          <Textarea
            id="cargo_description"
            {...register('cargo_description')}
            rows={4}
          />
          {errors.cargo_description && (
            <p className="mt-1 text-sm text-red-600">{errors.cargo_description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="weight_kg">Weight (kg)</Label>
            <Input
              id="weight_kg"
              type="number"
              step="0.01"
              {...register('weight_kg', { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="volume_cbm">Volume (CBM)</Label>
            <Input
              id="volume_cbm"
              type="number"
              step="0.01"
              {...register('volume_cbm', { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="value_usd">Value (USD)</Label>
            <Input
              id="value_usd"
              type="number"
              step="0.01"
              {...register('value_usd', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_hazardous"
            checked={watch('is_hazardous')}
            onCheckedChange={(checked) => setValue('is_hazardous', checked as boolean)}
          />
          <Label htmlFor="is_hazardous">Hazardous Materials</Label>
        </div>

        {watch('is_hazardous') && (
          <div>
            <Label htmlFor="hazard_class">Hazard Class</Label>
            <Input id="hazard_class" {...register('hazard_class')} />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={createContainer.isPending}>
        {createContainer.isPending ? 'Registering...' : 'Register Container'}
      </Button>
    </form>
  )
}
```

**Acceptance Criteria**:

- [ ] Form displays all required fields
- [ ] Validation works on submit
- [ ] Creates container successfully
- [ ] Shows loading state
- [ ] Hazardous materials section conditional
- [ ] All field types work correctly

**Dependencies**: Tasks 27, 29

**Rollback**: Delete file

---

### Task 31: Create Container Registration Page

**Objective**: Create page for container registration

**Files to create**:

- `src/app/(public)/containers/new/page.tsx`
- `src/app/(public)/layout.tsx`

**Content for `layout.tsx`**:

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch profile to verify user type
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', session.user.id)
    .single()

  if (profile?.user_type === 'staff') {
    redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Container Management
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
```

**Content for `page.tsx`**:

```typescript
import { ContainerRegistrationForm } from '@/components/containers/container-registration-form'

export default function NewContainerPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Register New Container</h2>
        <p className="mt-1 text-sm text-gray-600">
          Fill in the details below to register your cargo container.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <ContainerRegistrationForm />
      </div>
    </div>
  )
}
```

**Acceptance Criteria**:

- [ ] Can navigate to `/containers/new`
- [ ] Layout redirects unauthenticated users
- [ ] Layout redirects staff users to admin
- [ ] Form displays correctly
- [ ] Can create container

**Dependencies**: Tasks 25, 30

**Rollback**: Delete created files

---

### Task 32: Create Container List Component

**Objective**: Create component to display user's containers

**Files to create**:

- `src/components/containers/container-list.tsx`
- `src/components/containers/container-status-badge.tsx`

**Content for `container-status-badge.tsx`**:

```typescript
import { Badge } from '@/components/ui/badge'
import { ContainerStatus } from '@/types/container'

const statusConfig: Record<
  ContainerStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  registered: { label: 'Registered', variant: 'secondary' },
  in_transit: { label: 'In Transit', variant: 'default' },
  arrived: { label: 'Arrived', variant: 'default' },
  pending_inspection: { label: 'Pending Inspection', variant: 'outline' },
  under_inspection: { label: 'Under Inspection', variant: 'outline' },
  inspection_complete: { label: 'Inspection Complete', variant: 'default' },
  cleared: { label: 'Cleared', variant: 'default' },
  detained: { label: 'Detained', variant: 'destructive' },
  released: { label: 'Released', variant: 'default' },
  departed: { label: 'Departed', variant: 'secondary' },
}

export function ContainerStatusBadge({ status }: { status: ContainerStatus }) {
  const config = statusConfig[status]

  return <Badge variant={config.variant}>{config.label}</Badge>
}
```

**Content for `container-list.tsx`**:

```typescript
'use client'

import { useState } from 'react'
import { useContainers } from '@/lib/hooks/use-containers'
import { ContainerStatusBadge } from './container-status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'

export function ContainerList() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data, isLoading, error } = useContainers({
    page,
    limit: 20,
    status: statusFilter || undefined,
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading containers...</div>
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading containers. Please try again.
      </div>
    )
  }

  const containers = data?.data || []
  const meta = data?.meta

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Containers</CardTitle>
        <Link href="/containers/new">
          <Button>Register New Container</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {containers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No containers found.</p>
            <Link href="/containers/new">
              <Button className="mt-4" variant="outline">
                Register your first container
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Container #</TableHead>
                  <TableHead>Bill of Lading</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((container) => (
                  <TableRow key={container.id}>
                    <TableCell className="font-medium">
                      {container.container_number}
                    </TableCell>
                    <TableCell>{container.bill_of_lading}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {container.cargo_description}
                    </TableCell>
                    <TableCell>
                      <ContainerStatusBadge status={container.status} />
                    </TableCell>
                    <TableCell>
                      {format(new Date(container.registration_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Link href={`/containers/${container.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {meta && meta.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {meta.page} of {meta.totalPages} ({meta.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= meta.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

**Acceptance Criteria**:

- [ ] List displays user's containers
- [ ] Status badges show correct colors
- [ ] Pagination works
- [ ] Empty state shows when no containers
- [ ] Dates formatted correctly
- [ ] Loading state displays

**Dependencies**: Tasks 29, 3

**Rollback**: Delete created files

---

### Task 33: Create Dashboard Page

**Objective**: Create main dashboard for public users

**Files to create**:

- `src/app/(public)/dashboard/page.tsx`

**Content**:

```typescript
import { ContainerList } from '@/components/containers/container-list'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">
          Track and manage your cargo containers.
        </p>
      </div>

      <ContainerList />
    </div>
  )
}
```

**Acceptance Criteria**:

- [ ] Can navigate to `/dashboard`
- [ ] Container list displays
- [ ] Protected by auth middleware
- [ ] Public users see their containers only

**Dependencies**: Tasks 32

**Rollback**: Delete file

---

### Task 34: Add React Query Provider

**Objective**: Set up React Query for client-side data fetching

**Files to create/modify**:

- `src/app/providers.tsx`
- `src/app/layout.tsx`

**Content for `providers.tsx`**:

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
```

**Modify `app/layout.tsx`**:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Maritime Container Inspection',
  description: 'Track and manage maritime container inspections',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**Acceptance Criteria**:

- [ ] React Query provider wraps app
- [ ] Toaster displays notifications
- [ ] Queries cache correctly
- [ ] No hydration errors

**Dependencies**: Task 2

**Rollback**: Revert changes to layout.tsx, delete providers.tsx

---

### Task 35: Create Container Detail View API

**Objective**: Create API endpoint for single container details

**Files to create**:

- `src/app/api/containers/[id]/route.ts`

**Content**:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('containers')
      .select(
        `
        *,
        origin_port:ports!origin_port_id(id, name, code, city, country_code),
        destination_port:ports!destination_port_id(id, name, code, city, country_code),
        current_port:ports!current_port_id(id, name, code, city, country_code)
      `
      )
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Verify ownership (RLS should handle this, but double-check)
    if (data.owner_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get status history
    const { data: history } = await supabase
      .from('container_status_history')
      .select('*')
      .eq('container_id', params.id)
      .order('changed_at', { ascending: false })

    return NextResponse.json({
      data: {
        ...data,
        status_history: history || [],
      },
    })
  } catch (error) {
    console.error('Container fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Acceptance Criteria**:

- [ ] Can fetch single container by ID
- [ ] Returns 404 for non-existent containers
- [ ] Returns 403 for containers owned by other users
- [ ] Includes related port information
- [ ] Includes status history

**Dependencies**: Task 28

**Rollback**: Delete file

---

### Task 36: Create Container Detail Page

**Objective**: Create detailed view page for single container

**Files to create**:

- `src/app/(public)/containers/[id]/page.tsx`
- `src/components/containers/container-details.tsx`
- `src/lib/hooks/use-container.ts`

**Content for `use-container.ts`**:

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { Container } from '@/types/container'

export function useContainer(id: string) {
  return useQuery<{ data: Container & { status_history: any[] } }>({
    queryKey: ['container', id],
    queryFn: async () => {
      const res = await fetch(`/api/containers/${id}`)

      if (!res.ok) {
        throw new Error('Failed to fetch container')
      }

      return res.json()
    },
  })
}
```

**Content for `container-details.tsx`**:

```typescript
'use client'

import { useContainer } from '@/lib/hooks/use-container'
import { ContainerStatusBadge } from './container-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'

export function ContainerDetails({ id }: { id: string }) {
  const { data, isLoading, error } = useContainer(id)

  if (isLoading) {
    return <div className="text-center py-8">Loading container details...</div>
  }

  if (error || !data) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading container details.
      </div>
    )
  }

  const container = data.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {container.container_number}
          </h2>
          <p className="text-sm text-gray-600">BOL: {container.bill_of_lading}</p>
        </div>
        <ContainerStatusBadge status={container.status} />
      </div>

      {/* Container Information */}
      <Card>
        <CardHeader>
          <CardTitle>Container Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Container Type</p>
            <p className="mt-1">{container.container_type}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Seal Number</p>
            <p className="mt-1">{container.seal_number || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Hazardous</p>
            <p className="mt-1">{container.is_hazardous ? 'Yes' : 'No'}</p>
          </div>
          {container.hazard_class && (
            <div>
              <p className="text-sm font-medium text-gray-500">Hazard Class</p>
              <p className="mt-1">{container.hazard_class}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipper & Consignee */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipper</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{container.shipper_name}</p>
            {container.shipper_address && (
              <p className="mt-2 text-sm text-gray-600">{container.shipper_address}</p>
            )}
            {container.shipper_country && (
              <p className="mt-1 text-sm text-gray-600">Country: {container.shipper_country}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consignee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{container.consignee_name}</p>
            {container.consignee_address && (
              <p className="mt-2 text-sm text-gray-600">{container.consignee_address}</p>
            )}
            {container.consignee_country && (
              <p className="mt-1 text-sm text-gray-600">Country: {container.consignee_country}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cargo Information */}
      <Card>
        <CardHeader>
          <CardTitle>Cargo Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="mt-1">{container.cargo_description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            {container.weight_kg && (
              <div>
                <p className="text-sm font-medium text-gray-500">Weight</p>
                <p className="mt-1">{container.weight_kg.toLocaleString()} kg</p>
              </div>
            )}
            {container.volume_cbm && (
              <div>
                <p className="text-sm font-medium text-gray-500">Volume</p>
                <p className="mt-1">{container.volume_cbm.toLocaleString()} CBM</p>
              </div>
            )}
            {container.value_usd && (
              <div>
                <p className="text-sm font-medium text-gray-500">Value</p>
                <p className="mt-1">${container.value_usd.toLocaleString()} USD</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      {container.status_history && container.status_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {container.status_history.map((history: any) => (
                <div key={history.id} className="flex justify-between border-b pb-4 last:border-0">
                  <div>
                    <ContainerStatusBadge status={history.status} />
                    {history.location && (
                      <p className="mt-1 text-sm text-gray-600">Location: {history.location}</p>
                    )}
                    {history.notes && (
                      <p className="mt-1 text-sm text-gray-600">{history.notes}</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(history.changed_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

**Content for `page.tsx`**:

```typescript
import { ContainerDetails } from '@/components/containers/container-details'

export default function ContainerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <ContainerDetails id={params.id} />
    </div>
  )
}
```

**Acceptance Criteria**:

- [ ] Can view container details at `/containers/[id]`
- [ ] All information displays correctly
- [ ] Status history shows if exists
- [ ] Related ports display
- [ ] Loading and error states work

**Dependencies**: Task 35

**Rollback**: Delete created files

---

### Task 37: Update Middleware for User Type Routing

**Objective**: Route users to appropriate dashboard based on user type

**Files to modify**:

- `src/middleware.ts`

**Update content**:

```typescript
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const path = request.nextUrl.pathname

  // Public routes
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(path)

  if (isPublicRoute) {
    return response
  }

  // Check session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', session.user.id)
    .single()

  // Route based on user type
  if (path.startsWith('/admin') || path.startsWith('/(staff)')) {
    if (profile?.user_type !== 'staff') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (path.startsWith('/dashboard') || path.startsWith('/containers')) {
    if (profile?.user_type === 'staff') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Redirect authenticated users from auth pages
  if (isPublicRoute && path !== '/' && session) {
    if (profile?.user_type === 'staff') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

**Acceptance Criteria**:

- [ ] Public users routed to `/dashboard`
- [ ] Staff users routed to `/admin/dashboard`
- [ ] Public users can't access `/admin` routes
- [ ] Staff users can't access public user routes
- [ ] Unauthenticated users redirected to login

**Dependencies**: Task 25

**Rollback**: Revert to previous middleware version

---

## Phase 5: Polish Phase (Tasks 38-42)

### Task 38: Add Loading States and Skeletons

**Objective**: Improve UX with loading skeletons

**Files to create**:

- `src/components/shared/container-list-skeleton.tsx`
- `src/components/shared/container-detail-skeleton.tsx`

**Content for `container-list-skeleton.tsx`**:

```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ContainerListSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Update `container-list.tsx` to use skeleton**:

```typescript
// In ContainerList component
if (isLoading) {
  return <ContainerListSkeleton />
}
```

**Acceptance Criteria**:

- [ ] Skeletons display while loading
- [ ] Smooth transition to actual content
- [ ] Matches layout of loaded content

**Dependencies**: Task 32

**Rollback**: Remove skeleton components, revert to text loading

---

### Task 39: Add Error Boundary Components

**Objective**: Handle errors gracefully with error boundaries

**Files to create**:

- `src/app/(public)/error.tsx`
- `src/components/shared/error-message.tsx`

**Content for `error.tsx`**:

```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            We encountered an error while loading this page. Please try again.
          </p>
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Content for `error-message.tsx`**:

```typescript
import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message: string
}

export function ErrorMessage({ title = 'Error', message }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  )
}
```

**Acceptance Criteria**:

- [ ] Error boundary catches errors
- [ ] User-friendly error message displays
- [ ] Reset button works
- [ ] Errors logged to console

**Dependencies**: Task 3

**Rollback**: Delete files

---

### Task 40: Add Empty States

**Objective**: Improve UX with helpful empty states

**Files to create**:

- `src/components/shared/empty-state.tsx`

**Content**:

```typescript
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="h-12 w-12 text-gray-400" />}
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

**Update `container-list.tsx` to use EmptyState**:

```typescript
import { Package } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { useRouter } from 'next/navigation'

// In ContainerList component
const router = useRouter()

if (containers.length === 0) {
  return (
    <EmptyState
      icon={Package}
      title="No containers found"
      description="Get started by registering your first container."
      action={{
        label: 'Register Container',
        onClick: () => router.push('/containers/new'),
      }}
    />
  )
}
```

**Acceptance Criteria**:

- [ ] Empty state displays when no data
- [ ] Icon displays correctly
- [ ] Action button works
- [ ] Helpful messaging

**Dependencies**: Task 32

**Rollback**: Revert to inline empty state

---

### Task 41: Add Form Validation Feedback

**Objective**: Improve form UX with better validation feedback

**Files to modify**:

- `src/components/containers/container-registration-form.tsx`

**Add real-time validation hints**:

```typescript
// Add helper text for container number format
<div>
  <Label htmlFor="container_number">Container Number *</Label>
  <Input
    id="container_number"
    placeholder="ABCD1234567"
    {...register('container_number')}
  />
  <p className="mt-1 text-xs text-gray-500">
    Format: 4 letters + 7 numbers (e.g., MSCU1234567)
  </p>
  {errors.container_number && (
    <p className="mt-1 text-sm text-red-600">{errors.container_number.message}</p>
  )}
</div>

// Add character counters for limited fields
<div>
  <Label htmlFor="cargo_description">
    Cargo Description * ({watch('cargo_description')?.length || 0} characters)
  </Label>
  <Textarea
    id="cargo_description"
    {...register('cargo_description')}
    rows={4}
  />
  {errors.cargo_description && (
    <p className="mt-1 text-sm text-red-600">{errors.cargo_description.message}</p>
  )}
</div>
```

**Acceptance Criteria**:

- [ ] Helper text shows format requirements
- [ ] Character counters work
- [ ] Validation errors clear on fix
- [ ] Visual feedback on invalid fields

**Dependencies**: Task 30

**Rollback**: Remove added hints

---

### Task 42: Add Navigation Header

**Objective**: Add proper navigation to public user layout

**Files to create**:

- `src/components/layout/header.tsx`

**Content**:

```typescript
'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Header() {
  const { profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            GTMS
          </Link>
          <nav className="hidden space-x-4 md:flex">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/containers/new"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Register Container
            </Link>
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              {profile?.full_name || 'Account'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {profile?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

**Update `(public)/layout.tsx`**:

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', session.user.id)
    .single()

  if (profile?.user_type === 'staff') {
    redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
```

**Acceptance Criteria**:

- [ ] Header displays on all public pages
- [ ] Navigation links work
- [ ] User dropdown shows profile info
- [ ] Sign out works correctly
- [ ] Responsive on mobile

**Dependencies**: Tasks 22, 31

**Rollback**: Remove header component, revert layout

---

## Testing & Validation Checklist

After completing all tasks, verify the following end-to-end scenarios:

### Scenario 1: New User Registration & Container Creation

- [ ] Navigate to `/register`
- [ ] Create new public user account
- [ ] Verify email received (check Supabase email logs)
- [ ] Confirm email (if verification enabled)
- [ ] Login with new account
- [ ] Redirected to `/dashboard`
- [ ] Click "Register Container"
- [ ] Fill out container form
- [ ] Submit successfully
- [ ] See container in dashboard list
- [ ] Click to view details
- [ ] All data displays correctly

### Scenario 2: Authentication Flow

- [ ] Logout
- [ ] Try accessing `/dashboard` without auth → redirected to `/login`
- [ ] Login with valid credentials
- [ ] Redirected to dashboard
- [ ] Session persists on page refresh

### Scenario 3: Data Isolation

- [ ] Create container with User A
- [ ] Logout
- [ ] Login as User B
- [ ] Verify User B cannot see User A's containers
- [ ] Verify direct URL to User A's container returns 403

### Scenario 4: Error Handling

- [ ] Submit invalid container number format → see validation error
- [ ] Submit incomplete form → see required field errors
- [ ] Try duplicate container number → see database error
- [ ] Disconnect internet → see network error handling

---

## Post-MVP Backlog

Features to implement after MVP is complete and tested:

### Phase 6: OCR Integration (Tasks 43-48) ✅ COMPLETED

- Task 43: Set up Google Cloud Vision API credentials ✅
- Task 44: Create document upload API route ✅
- Task 45: Implement OCR processing function ✅
- Task 46: Create OCR result parsing logic ✅
- Task 47: Build document upload UI component ✅
- Task 48: Create OCR review/correction interface ✅

### Phase 7: Container Tracking & Vessel Monitoring (Tasks 49-62)

**Objective**: Implement real-time vessel tracking using Mapbox and AIS Stream to monitor containers in transit

**Design Reference**: `/home/okcee/GTMS/design/tracking.png`

**Tech Stack**:
- Mapbox GL JS for interactive maps
- AIS Stream API (aisstream.io) for real-time vessel positions
- WebSocket for live AIS data updates
- Deck.gl for advanced map visualizations (optional)

#### Task 49: Set Up Mapbox Integration
- Configure Mapbox account and get API token
- Install mapbox-gl package
- Create map configuration utilities
- Set up TypeScript types for map components

#### Task 50: Set Up AIS Stream Integration
- Create AIS Stream account at aisstream.io
- Configure WebSocket client for real-time vessel data
- Implement message parsing for position reports
- Add reconnection logic

#### Task 51: Create Vessels Database Tables
- Create `vessels` table (IMO, MMSI, name, type, status, etc.)
- Create `vessel_positions` table (tracking history)
- Create `container_vessel_links` table (link containers to vessels)
- Add indexes and RLS policies

#### Task 52: Create Vessel Tracking API Routes
- `GET /api/vessels` - List vessels with filters
- `GET /api/vessels/[id]` - Vessel details
- `GET /api/vessels/[id]/positions` - Position history
- `GET /api/vessels/nearby` - Vessels near a location
- `POST /api/vessels/sync-ais` - Sync AIS data to database

#### Task 53: Create Vessel React Query Hooks
- `useVesselList()` - Fetch vessel list
- `useVesselDetail()` - Fetch vessel details
- `useVesselPositions()` - Fetch position history
- `useAISStream()` - Real-time WebSocket connection

#### Task 54: Build Interactive Map Component
- Create Mapbox GL map component
- Add vessel markers (colored by status)
- Add port markers
- Draw route lines between ports
- Implement zoom/pan controls
- Add marker clustering for many vessels

#### Task 55: Build Vessel List Sidebar
- Scrollable list of incoming/nearby vessels
- Search by vessel name or IMO
- Filter by status (IN_TRANSIT, AT_BERTH, ANCHORED, SCHEDULED)
- Status badges and ETA display
- Click vessel to select on map

#### Task 56: Build Vessel Detail Panel
- Side panel with vessel information
- Current position (lat/lng, speed, course)
- Schedule (last port, next port, ETA)
- Linked containers list
- Action buttons (Inspect, Manifest, Track Container)

#### Task 57: Implement Real-time Position Updates
- WebSocket connection to AIS Stream
- Parse incoming position messages
- Update React Query cache with new positions
- Animate vessel markers on map
- Connection status indicator

#### Task 58: Build Vessel Monitoring Dashboard Page
- Main tracking page at `/dashboard/tracking`
- Stats cards (Total Vessels, High Risk, In Transit, At Berth)
- Layout: Vessel list (left) + Map (center) + Detail panel (right)
- Responsive design for mobile/tablet

#### Task 59: Link Containers to Vessels
- Dialog to search and link vessel to container
- API endpoint to create container-vessel link
- Display linked vessel in container details
- Show container location via vessel position on map

#### Task 60: Add Vessel Search Functionality
- Global search in top bar
- Autocomplete by vessel name, IMO, or MMSI
- Click result → navigate to tracking page
- Map centers on selected vessel

#### Task 61: Implement Vessel Route Visualization
- Draw route line from origin to destination
- Show historical track (breadcrumb trail)
- Display waypoints
- Animate vessel along route
- Toggle route visibility

#### Task 62: Add Geofencing & Alerts
- Define geofence zones (port areas, territorial waters)
- Monitor vessel positions
- Create alerts when vessel enters/exits zone
- Alert notifications in UI
- Alert history storage

### Phase 8: Real-time Notifications (Tasks 63-67)

- Task 63: Create notifications table migration
- Task 64: Set up Supabase Realtime subscriptions
- Task 65: Create notification API routes
- Task 66: Build notification bell component
- Task 67: Implement email notification triggers

### Phase 9: Staff Features (Tasks 68-74)

- Task 68: Create staff_roles table migration
- Task 69: Implement staff dashboard
- Task 70: Create inspection workflow
- Task 71: Build container search for staff
- Task 72: Add risk scoring function
- Task 73: Create inspection queue
- Task 74: Build analytics dashboard

---

## Notes for AI Engineer

1. **Test After Every Task**: Run the application after each task to verify it works before proceeding
2. **Database Changes**: Always test database migrations in Supabase SQL Editor before marking complete
3. **Type Safety**: Run `pnpm type-check` frequently to catch TypeScript errors early
4. **Environment Variables**: Never commit `.env.local` - keep credentials secure
5. **Git Commits**: Commit after each successful task with descriptive message
6. **Rollback Ready**: Keep the previous working state accessible in case rollback needed
7. **Ask Questions**: If a task is unclear or seems to conflict with previous work, ask for clarification before proceeding

---

## Success Criteria for MVP

The MVP is complete when:

- [ ] Public users can register and login
- [ ] Public users can manually register containers with all required fields
- [ ] Public users can view their container list with pagination
- [ ] Public users can view detailed container information
- [ ] Container status tracking works
- [ ] All forms have proper validation
- [ ] Error states handled gracefully
- [ ] Application is responsive on mobile/tablet/desktop
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] All RLS policies working (users can't see others' data)

---

**End of Tasks Document**
