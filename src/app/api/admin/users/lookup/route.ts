// API endpoint for user lookup functionality
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    console.log('🔍 Searching users with query:', query);

    // Search in multiple collections
    const collections = ['users', 'students', 'rtos', 'supervisors', 'assessors'];
    const allUsers: any[] = [];

    for (const collectionName of collections) {
      try {
        const snapshot = await adminDb.collection(collectionName).get();
        
        snapshot.docs.forEach((doc: any) => {
          const userData = doc.data();
          const email = userData.email?.toLowerCase() || '';
          const name = (userData.name || userData.displayName || '').toLowerCase();
          
          // Search by email or name
          if (email.includes(query) || name.includes(query)) {
            allUsers.push({
              id: doc.id,
              email: userData.email || '',
              name: userData.name || userData.displayName || 'Unknown User',
              role: collectionName.slice(0, -1), // Remove 's' from collection name
              collection: collectionName,
              createdAt: userData.createdAt?.toDate?.() || new Date(),
              verificationStatus: userData.verificationStatus || 'unknown'
            });
          }
        });
      } catch (error) {
        console.warn(`⚠️ Error searching collection ${collectionName}:`, error);
      }
    }

    // Remove duplicates based on email and sort by relevance
    const uniqueUsers = allUsers
      .filter((user, index, self) => 
        index === self.findIndex(u => u.email === user.email)
      )
      .sort((a, b) => {
        // Prioritize exact email matches
        if (a.email.toLowerCase() === query) return -1;
        if (b.email.toLowerCase() === query) return 1;
        
        // Then by email starting with query
        if (a.email.toLowerCase().startsWith(query)) return -1;
        if (b.email.toLowerCase().startsWith(query)) return 1;
        
        // Then by name starting with query
        if (a.name.toLowerCase().startsWith(query)) return -1;
        if (b.name.toLowerCase().startsWith(query)) return 1;
        
        // Finally alphabetically
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);

    console.log(`✅ Found ${uniqueUsers.length} users matching "${query}"`);
    
    return NextResponse.json({ users: uniqueUsers });
  } catch (error) {
    console.error('❌ User lookup error:', error);
    return NextResponse.json({ 
      error: 'Failed to search users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}