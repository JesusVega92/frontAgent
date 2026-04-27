import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Space } from '@/models/Space';
import { connectDB } from '@/lib/db';

const initialSpaces = [
  { title: 'Room 401', description: 'Conference Suite A' },
  { title: 'Station 12', description: 'Hot Desk - East Wing' },
  { title: 'Booth 04', description: 'Quiet Zone' },
  { title: 'Lab 01', description: 'Creative Studio' },
  { title: 'Room 202', description: 'Executive Boardroom' },
  { title: 'Desk 08', description: 'North Wing' },
  { title: 'Zone C', description: 'Community Lounge' },
  { title: 'Station 44', description: 'Quiet Alcove' },
];

export async function GET() {
  try {
    await connectDB();
    let spaces = await Space.find().sort({ createdAt: -1 });
    
    if (spaces.length === 0) {
      await Space.insertMany(initialSpaces);
      spaces = await Space.find().sort({ createdAt: -1 });
    }
    
    return NextResponse.json(spaces);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== 'admin' && userRole !== 'dev') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const space = await Space.create({
      title,
      description: description || '',
    });

    return NextResponse.json(space, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create space' },
      { status: 500 }
    );
  }
}