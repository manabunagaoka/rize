import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';


// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['startup_name', 'one_liner', 'elevator_pitch', 'category', 'founders', 'stage', 'user_id', 'user_email'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate length constraints
    if (body.one_liner.length > 50) {
      return NextResponse.json(
        { error: 'One-liner must be 50 characters or less' },
        { status: 400 }
      );
    }

    if (body.elevator_pitch.length > 200) {
      return NextResponse.json(
        { error: 'Elevator pitch must be 200 characters or less' },
        { status: 400 }
      );
    }

    // Insert into database
    const { data, error } = await supabase
      .from('student_projects')
      .insert({
        user_id: body.user_id,
        user_email: body.user_email,
        user_name: body.user_name,
        user_class: body.user_class,
        startup_name: body.startup_name,
        one_liner: body.one_liner,
        elevator_pitch: body.elevator_pitch,
        category: body.category,
        founders: body.founders,
        stage: body.stage,
        traction_type: body.traction_type || null,
        traction_value: body.traction_value || null,
        website_url: body.website_url || null,
        problem_statement: body.problem_statement || null,
        status: 'pending' // Will be reviewed by admin
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save startup. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
