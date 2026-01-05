import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { containerUpdateSchema } from '@/lib/validations/container.validations'
import { ZodError } from 'zod'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

/**
 * GET /api/containers/[id]
 * Fetch a single container by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id } = params

    // Fetch container with relationships
    const { data: container, error: containerError } = await supabase
      .from('containers')
      .select(
        `
        *,
        owner:owner_id(id, email, full_name, user_type)
      `
      )
      .eq('id', id)
      .eq('owner_id', userId) // RLS: only owner can view
      .single()

    if (containerError) {
      if (containerError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Container not found' },
          { status: 404 }
        )
      }

      console.error('Error fetching container:', containerError)
      return NextResponse.json(
        { error: 'Failed to fetch container' },
        { status: 500 }
      )
    }

    return NextResponse.json(container, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in container GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/containers/[id]
 * Update a container
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id } = params

    // Check if container exists and user owns it
    const { data: existingContainer, error: fetchError } = await supabase
      .from('containers')
      .select('id, status, owner_id')
      .eq('id', id)
      .eq('owner_id', userId)
      .single()

    if (fetchError || !existingContainer) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = containerUpdateSchema.parse(body)

    // Update container with updated_by and updated_at
    const updateData = {
      ...validatedData,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedContainer, error: updateError } = await supabase
      .from('containers')
      .update(updateData)
      .eq('id', id)
      .eq('owner_id', userId)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating container:', updateError)
      return NextResponse.json(
        { error: 'Failed to update container' },
        { status: 500 }
      )
    }

    // If status changed, create status history entry
    if (validatedData.status && validatedData.status !== existingContainer.status) {
      const { error: historyError } = await supabase
        .from('container_status_history')
        .insert({
          container_id: id,
          old_status: existingContainer.status,
          new_status: validatedData.status,
          changed_by: userId,
          notes: `Status changed from ${existingContainer.status} to ${validatedData.status}`,
        })

      if (historyError) {
        console.error('Error creating status history:', historyError)
        // Don't fail the request, but log the error
      }
    }

    return NextResponse.json(updatedContainer, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('Unexpected error in container PATCH API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/containers/[id]
 * Delete a container (soft delete by setting deleted_at)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id } = params

    // Check if container exists and user owns it
    const { data: existingContainer, error: fetchError } = await supabase
      .from('containers')
      .select('id, owner_id')
      .eq('id', id)
      .eq('owner_id', userId)
      .single()

    if (fetchError || !existingContainer) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting deleted_at
    const { error: deleteError } = await supabase
      .from('containers')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('owner_id', userId)

    if (deleteError) {
      console.error('Error deleting container:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete container' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Container deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in container DELETE API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
