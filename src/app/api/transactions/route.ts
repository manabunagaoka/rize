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
    { 
      auth: { persistSession: false },
      db: { schema: 'public' },
      global: {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'x-supabase-api-version': '2024-01-01'
        }
      }
    }
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
    // Multiple attempts with delays to handle replication lag
    let transactions = null;
    let error = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await supabase
        .from('investment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      
      transactions = result.data;
      error = result.error;
      
      if (transactions && transactions.length > 0) break;
      
      // Wait 500ms before retry
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`[Transactions API] Retry ${attempt + 1} - refetching transactions`);
      }
    }

    if (error) {
      console.error('Transaction fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Add company tickers
    const companyTickers: { [key: number]: string } = {
      1: 'META',
      2: 'MSFT',
      3: 'DBX',
      4: 'AKAM',
      5: 'RDDT',
      6: 'WRBY',
      7: 'BKNG',
    };

    const enrichedTransactions = transactions?.map(tx => ({
      ...tx,
      ticker: companyTickers[tx.pitch_id] || `PITCH${tx.pitch_id}`,
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
