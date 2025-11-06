import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

// Verify user from Manaboodle SSO
async function verifyUser(request: NextRequest) {
  const token = request.cookies.get('manaboodle_sso_token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch('https://www.manaboodle.com/api/sso/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const user = data.user || data;
    
    return {
      id: user.id,
      email: user.email
    };
  } catch (error) {
    console.error('SSO verification error:', error);
    return null;
  }
}

// GET - Fetch user's transaction history
export async function GET(request: NextRequest) {
  // Create fresh Supabase client to avoid caching
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
  
  try {
    const user = await verifyUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get ALL transactions (removed limit) ordered by most recent
    const { data: transactions, error } = await supabase
      .from('investment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Transaction fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Add company names and calculate realized gains
    const companyNames: { [key: number]: { name: string; ticker: string } } = {
      1: { name: 'Facebook', ticker: 'META' },
      2: { name: 'Microsoft', ticker: 'MSFT' },
      3: { name: 'Dropbox', ticker: 'DBX' },
      4: { name: 'Akamai', ticker: 'AKAM' },
      5: { name: 'Reddit', ticker: 'RDDT' },
      6: { name: 'Warby Parker', ticker: 'WRBY' },
      7: { name: 'Booking.com', ticker: 'BKNG' },
    };

    const enrichedTransactions = transactions?.map(tx => ({
      ...tx,
      company_name: companyNames[tx.pitch_id]?.name || `Company #${tx.pitch_id}`,
      ticker: companyNames[tx.pitch_id]?.ticker || 'N/A',
      // For sell transactions, calculate realized gain/loss
      // This would require tracking cost basis - for now just show the transaction
    })) || [];

    return NextResponse.json({
      transactions: enrichedTransactions
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction history' },
      { status: 500 }
    );
  }
}
